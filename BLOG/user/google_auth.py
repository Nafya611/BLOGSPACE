from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
import requests
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.http import JsonResponse, HttpResponseRedirect
import urllib.parse
import os

User = get_user_model()

# Get the frontend URL from environment or use a default
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
FRONTEND_CALLBACK_PATH = os.environ.get('FRONTEND_CALLBACK_PATH', '/auth/callback')

# Construct the complete callback URL
FRONTEND_CALLBACK_URL = f"{FRONTEND_URL}{FRONTEND_CALLBACK_PATH}"

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """Handle Google OAuth token exchange"""
    code = request.data.get('code')
    if not code:
        return Response({'error': 'Authorization code is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Exchange code for access token
        token_url = 'https://oauth2.googleapis.com/token'
        token_data = {
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
            'client_secret': settings.GOOGLE_OAUTH_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
        }

        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()

        if 'access_token' not in token_json:
            return Response({'error': 'Failed to get access token'}, status=status.HTTP_400_BAD_REQUEST)

        # Get user info from Google
        access_token = token_json['access_token']
        user_info_url = f'https://www.googleapis.com/oauth2/v1/userinfo?access_token={access_token}'
        user_response = requests.get(user_info_url)
        user_data = user_response.json()

        # Create or get user
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'username': user_data['email'],
                'first_name': user_data.get('given_name', ''),
                'last_name': user_data.get('family_name', ''),
            }
        )

        # Create JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth_config(request):
    """Return Google OAuth client_id and redirect_uri"""
    return Response({
        'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
        'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def google_login_simple(request):
    """Generate Google OAuth URL for frontend"""
    # Google OAuth parameters
    oauth_params = {
        'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
        'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
        'scope': 'email profile',
        'response_type': 'code',
        'access_type': 'offline',
        'include_granted_scopes': 'true'
    }

    # Create OAuth URL
    oauth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(oauth_params)}"

    return Response({
        'oauth_url': oauth_url,
        'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
        'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
        'message': 'Visit the oauth_url to authenticate with Google'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth_callback(request):
    """Handle the OAuth callback - same as the test that worked"""
    code = request.GET.get('code')
    error = request.GET.get('error')

    if error:
        # Redirect to frontend with error
        return HttpResponseRedirect(f'{FRONTEND_CALLBACK_URL}?error={error}')

    if not code:
        return HttpResponseRedirect(f'{FRONTEND_CALLBACK_URL}?error=no_code')

    try:
        # Exchange code for access token
        token_url = 'https://oauth2.googleapis.com/token'
        token_data = {
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
            'client_secret': settings.GOOGLE_OAUTH_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
        }

        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()

        if 'access_token' not in token_json:
            return HttpResponseRedirect(f'{FRONTEND_CALLBACK_URL}?error=token_exchange_failed&details={urllib.parse.quote(str(token_json))}')

        # Get user info from Google
        access_token = token_json['access_token']
        user_info_url = f'https://www.googleapis.com/oauth2/v1/userinfo?access_token={access_token}'
        user_response = requests.get(user_info_url)
        user_data = user_response.json()

        # Create or get user
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'username': user_data['email'],
                'first_name': user_data.get('given_name', ''),
                'last_name': user_data.get('family_name', ''),
            }
        )

        # Create JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token_jwt = str(refresh.access_token)
        refresh_token_jwt = str(refresh)

        # Redirect to frontend with tokens
        redirect_url = f'{FRONTEND_CALLBACK_URL}?access_token={access_token_jwt}&refresh_token={refresh_token_jwt}&user_id={user.id}&email={user.email}'
        return HttpResponseRedirect(redirect_url)

    except Exception as e:
        return HttpResponseRedirect(f'{FRONTEND_CALLBACK_URL}?error={urllib.parse.quote(str(e))}')

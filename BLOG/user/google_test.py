from django.http import JsonResponse, HttpResponseRedirect
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import urllib.parse
import requests

User = get_user_model()

@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth_test(request):
    """Simple Google OAuth test - generates the OAuth URL"""

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

    return JsonResponse({
        'oauth_url': oauth_url,
        'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
        'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
        'message': 'Visit the oauth_url to test Google OAuth'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth_callback_test(request):
    """Handle the OAuth callback and complete the authentication"""
    code = request.GET.get('code')
    error = request.GET.get('error')

    if error:
        return JsonResponse({
            'error': error,
            'error_description': request.GET.get('error_description', '')
        }, status=400)

    if not code:
        return JsonResponse({'error': 'No authorization code received'}, status=400)

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
            return JsonResponse({'error': 'Failed to get access token', 'details': token_json}, status=400)

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

        return JsonResponse({
            'success': True,
            'message': 'Google OAuth authentication completed successfully!',
            'user_created': created,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        })

    except Exception as e:
        return JsonResponse({
            'error': 'OAuth processing failed',
            'details': str(e)
        }, status=500)

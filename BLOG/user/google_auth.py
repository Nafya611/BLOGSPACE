from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
import requests
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

User = get_user_model()

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
    """Simple Google login flow - redirects to OAuth"""
    return Response({
        'message': 'Use the google-config endpoint to get OAuth configuration',
        'google_config_url': '/api/user/google-config/',
        'google_auth_url': '/api/user/google-auth/'
    })

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
import os
import json
import traceback

User = get_user_model()

@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth_test(request):
    """Simple Google OAuth test - generates the OAuth URL and provides detailed debugging info"""

    # Get environment variables for debugging
    client_id = settings.GOOGLE_OAUTH_CLIENT_ID
    redirect_uri = settings.GOOGLE_OAUTH_REDIRECT_URI
    env_info = {
        "GOOGLE_OAUTH_CLIENT_ID": client_id,
        "GOOGLE_OAUTH_REDIRECT_URI": redirect_uri,
        "FRONTEND_URL": os.environ.get('FRONTEND_URL', 'Not set'),
        "FRONTEND_CALLBACK_PATH": os.environ.get('FRONTEND_CALLBACK_PATH', 'Not set'),
        "DJANGO_SETTINGS_MODULE": os.environ.get('DJANGO_SETTINGS_MODULE', 'Not set'),
        "ALLOWED_HOSTS": os.environ.get('ALLOWED_HOSTS', 'Not set'),
    }

    # Google OAuth parameters
    oauth_params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': 'email profile',
        'response_type': 'code',
        'access_type': 'offline',
        'include_granted_scopes': 'true'
    }

    # Create OAuth URL
    oauth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(oauth_params)}"

    return JsonResponse({
        'oauth_url': oauth_url,
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'environment': env_info,
        'message': 'Visit the oauth_url to test Google OAuth',
        'debug_info': {
            'request_headers': dict(request.headers),
            'request_meta': {k: str(v) for k, v in request.META.items() if k.startswith('HTTP_')},
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth_callback_test(request):
    """Handle the OAuth callback and complete the authentication with detailed error reporting"""
    code = request.GET.get('code')
    error = request.GET.get('error')

    # Collect request info for debugging
    debug_info = {
        'request_headers': dict(request.headers),
        'request_GET': dict(request.GET),
        'request_META': {k: str(v) for k, v in request.META.items() if k.startswith('HTTP_')},
        'settings': {
            'GOOGLE_OAUTH_CLIENT_ID': settings.GOOGLE_OAUTH_CLIENT_ID,
            'GOOGLE_OAUTH_REDIRECT_URI': settings.GOOGLE_OAUTH_REDIRECT_URI,
        }
    }

    if error:
        return JsonResponse({
            'error': error,
            'error_description': request.GET.get('error_description', ''),
            'debug_info': debug_info
        }, status=400)

    if not code:
        return JsonResponse({
            'error': 'No authorization code received',
            'debug_info': debug_info
        }, status=400)

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

        debug_info['token_request'] = {
            'url': token_url,
            'data': {k: v for k, v in token_data.items() if k != 'client_secret'}
        }

        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()

        debug_info['token_response'] = {
            'status_code': token_response.status_code,
            'headers': dict(token_response.headers),
        }

        if 'access_token' not in token_json:
            debug_info['token_response']['error'] = token_json
            return JsonResponse({
                'error': 'Failed to get access token',
                'details': token_json,
                'debug_info': debug_info
            }, status=400)

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
            },
            'debug_info': debug_info
        })

    except Exception as e:
        # Get detailed exception info
        error_details = {
            'error_type': type(e).__name__,
            'error_message': str(e),
            'traceback': traceback.format_exc()
        }

        return JsonResponse({
            'error': 'OAuth processing failed',
            'details': error_details,
            'debug_info': debug_info
        }, status=500)

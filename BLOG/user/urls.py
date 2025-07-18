from django.urls import path
from .views import signup,create_token,manage_user,logout_user,upload_profile_image,get_user_profile
from .google_auth import google_auth, google_oauth_config, google_login_simple, google_oauth_callback
from .google_test import google_oauth_test, google_oauth_callback_test
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns=[
    path('signup/',signup,name='signup'),
    path('token/',create_token,name='token'),
    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    path('me',manage_user,name='me'),
    path('upload-profile-image/',upload_profile_image,name='upload_profile_image'),
    path('logout/',logout_user,name='logut'),
    path('profile/<str:username>/',get_user_profile,name='get_user_profile'),

    # Google OAuth endpoints (main)
    path('google-auth/', google_auth, name='google_auth'),
    path('google-config/', google_oauth_config, name='google_oauth_config'),
    path('google-login/', google_login_simple, name='google_login_simple'),
    path('google-callback/', google_oauth_callback, name='google_oauth_callback'),

    # Test endpoints (keep for debugging)
    path('google-test/', google_oauth_test, name='google_oauth_test'),
    path('google-callback-test/', google_oauth_callback_test, name='google_oauth_callback_test'),
]
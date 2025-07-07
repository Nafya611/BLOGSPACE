from django.urls import path
from .views import signup,create_token,manage_user,logout_user
from .google_auth import google_auth, google_oauth_config, google_login_simple

urlpatterns=[
    path('signup/',signup,name='signup'),
    path('token/',create_token,name='token'),
    path('me',manage_user,name='me'),
    path('logout/',logout_user,name='logut'),

    # Google OAuth endpoints
    path('google-auth/', google_auth, name='google_auth'),
    path('google-config/', google_oauth_config, name='google_oauth_config'),
    path('google-login/', google_login_simple, name='google_login_simple'),
]
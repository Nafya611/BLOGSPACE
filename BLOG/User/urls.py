from django.urls import path
from .views import signup,create_token,manage_user

urlpatterns=[
    path('user/signup/',signup,name='signup'),
    path('user/token/',create_token,name='token'),
    path('user/me',manage_user,name='me')

]
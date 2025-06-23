from django.urls import path
from .views import signup,create_token,manage_user,logout_user

urlpatterns=[
    path('signup/',signup,name='signup'),
    path('token/',create_token,name='token'),
    path('me',manage_user,name='me'),
    path('logout/',logout_user,name='logut')

]
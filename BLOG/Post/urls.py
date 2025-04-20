from django.urls import path
from .views import  Post_create

urlpatterns = [
    path('post_blog/',Post_create,name='Post_create' ),
]
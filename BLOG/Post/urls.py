from django.urls import path
from .views import  create_post,blog_list,blog_detail

urlpatterns = [
    path('post_blog/',create_post,name='create_post' ),
    path('blog_list/',blog_list,name="blog_list"),
    path('blog_detail/<str:slug>/',blog_detail,name="blog_detail")
]
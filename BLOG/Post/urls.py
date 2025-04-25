from django.urls import path
from .views import  create_post,blog_list,blog_detail,tag_list,get_tag_slug,get_Post_tag_slug

urlpatterns = [
    path('post_blog/',create_post,name='create_post' ),
    path('blog_list/',blog_list,name="blog_list"),
    path('blog_detail/<str:slug>/',blog_detail,name="blog_detail"),
    path('tag_list/',tag_list,name="tags_list"),
    path('tag_slug/<str:slug>',get_tag_slug,name="tag_slug"),
    path('post_tag_slug/<str:slug>',get_Post_tag_slug,name='get_post_tag_slag')
]
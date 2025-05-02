from django.urls import path
from .views import  create_post,blog_list,blog_detail,tag_list,get_tag_slug,get_Post_tag_slug,category_list,get_category_slug,get_Post_category_slug,comments

urlpatterns = [
    path('post_blog/',create_post,name='create_post' ),
    path('blog_list/',blog_list,name="blog_list"),
    path('blog_detail/<str:slug>/',blog_detail,name="blog_detail"),
    path('tag_list/',tag_list,name="tags_list"),
    path('tag_slug/<str:slug>',get_tag_slug,name="tag_slug"),
    path('post_tag_slug/<str:slug>',get_Post_tag_slug,name='get_post_catgory_slag'),
    path('category_list/',category_list,name="tags_list"),
    path('catgory_slug/<str:slug>',get_category_slug,name="category_slug"),
    path('post_category_slug/<str:slug>',get_Post_category_slug,name='get_post_catgory_slag'),
    path('post/<str:slug>/comments',comments,name="create_get_comments_by_slug")
]
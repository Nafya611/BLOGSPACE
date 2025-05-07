from django.urls import path
from .views import  create_post,blog_list,blog_detail,tag_list,get_tag_slug,get_Post_tag_slug,category_list,get_category_slug,get_Post_category_slug,comments,admin_posts,admin_post,publish_post,admin_comments,approve_comment,delete_comment

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
    path('post/<str:slug>/comments',comments,name="create_get_comments_by_slug"),
    path('admin/posts/',admin_posts,name='all_posts'),
    path('admin/post/<str:slug>',admin_post,name="post"),
    path('admin/publish_post/<str:slug>',publish_post,name="publish_post"),
    path('admin/comments',admin_comments,name="admin_comments"),
    path('admin/approve_comment/<int:pk>',approve_comment,name="approve-comment"),
    path('admin/delete_comment/<int:pk>',delete_comment,name="admin-delete-comment")

]
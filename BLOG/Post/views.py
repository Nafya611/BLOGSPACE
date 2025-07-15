from django.shortcuts import render
from Post.serializers import PostSerializer,TagSerializer,CategorySerializer,CommentSerializer
from rest_framework.decorators import api_view,authentication_classes,permission_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.response import Response
from rest_framework import response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.utils import extend_schema , OpenApiParameter# type: ignore
from Core.models import Post,Tag,Category,Comment
from django.shortcuts import get_object_or_404





#post

@extend_schema(
        methods=['POST','PATCH'],
        request=PostSerializer,
        responses=PostSerializer

)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_post(request):

    serializer= PostSerializer(data=request.data,context={'request':request})
    if serializer.is_valid():
        # Save - the serializer will handle setting the author from request.user
        serializer.save()
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
        OpenApiParameter(name='search', type=str, location=OpenApiParameter.QUERY, description='Search posts by title, content, or author'),
        OpenApiParameter(name='category', type=str, location=OpenApiParameter.QUERY, description='Filter by category slug'),
        OpenApiParameter(name='tag', type=str, location=OpenApiParameter.QUERY, description='Filter by tag slug'),
    ],
    responses={200: PostSerializer(many=True)}
)
@api_view(['GET'])
def blog_list(request):
    paginator = PageNumberPagination()
    paginator.page_size = 3

    # Start with all published posts
    posts = Post.objects.filter(is_published=True)

    # Search filter
    search = request.GET.get('search', '')
    if search:
        from django.db.models import Q
        posts = posts.filter(
            Q(title__icontains=search) |
            Q(content__icontains=search) |
            Q(author__username__icontains=search) |
            Q(author__first_name__icontains=search) |
            Q(author__last_name__icontains=search)
        )

    # Category filter
    category = request.GET.get('category', '').strip()
    if category:
        posts = posts.filter(category__slug=category)

    # Tag filter
    tag = request.GET.get('tag', '').strip()
    if tag:
        posts = posts.filter(tag__slug=tag)

    # Order by title
    posts = posts.order_by("title")

    result_page = paginator.paginate_queryset(posts, request)
    serializer = PostSerializer(result_page, many=True, context={'request': request})

    return paginator.get_paginated_response(serializer.data)

@extend_schema(
        methods=['PUT','PATCH'],
    request=PostSerializer,
    responses=PostSerializer
)
@api_view(['GET','PUT','PATCH','DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def blog_detail(request, slug):
    post = get_object_or_404(Post, author=request.user, slug=slug)

    if request.method == 'GET':
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = PostSerializer(instance=post, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        serializer=PostSerializer(instance=post, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        post.delete()
        return Response({'message': 'Deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# Tag

@api_view(['GET'])
def tag_list(request):
    tag=Tag.objects.all().order_by("name")
    serializer=TagSerializer(tag,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_tag_slug(request,slug):
    tag=Tag.objects.filter(user=request.user,slug=slug)
    serializer=TagSerializer(tag,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_Post_tag_slug(request,slug):
    tag=get_object_or_404(Tag,slug=slug)
    post=Post.objects.filter(author=request.user,tag__in=[tag.id])
    serializer=PostSerializer(post,many=True,context={'request': request})
    return Response(serializer.data,status=status.HTTP_200_OK)

## category


@api_view(['GET'])
def category_list(request):
    category = Category.objects.all().order_by('name')
    serializer = CategorySerializer(category, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_category_slug(request, slug):
    category = Category.objects.filter(user=request.user, slug=slug)
    serializer = CategorySerializer(category, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_Post_category_slug(request,slug):
    category=get_object_or_404(Category,slug=slug)
    post=Post.objects.get(author=request.user,category=category)
    serializer=PostSerializer(post,context={'request': request})
    return Response(serializer.data,status=status.HTTP_200_OK)

#comment

@extend_schema(

        parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),

    ],
    responses={200: CommentSerializer(many=True)}

)
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def read_comments(request,slug):
    try:
        post=Post.objects.get(slug=slug)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"},status=status.HTTP_404_NOT_FOUND)
    post=Post.objects.get(slug=slug)

    paginator=PageNumberPagination()
    paginator.page_size= 1
    comment=Comment.objects.filter(post=post).order_by('-created_at')
    paginated_comment=paginator.paginate_queryset(comment,request)

    serializer=CommentSerializer(paginated_comment,many=True)
    return paginator.get_paginated_response(serializer.data)

@extend_schema(
        methods=['POST'],
        request=CommentSerializer,
        responses=CommentSerializer


)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def send_comment(request,slug):
    try:
        post=Post.objects.get(slug=slug)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"},status=status.HTTP_404_NOT_FOUND)

    serializer=CommentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(post=post)
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

# Admin

@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),

    ],
    responses={200: PostSerializer(many=True)}
)
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def admin_posts(request):

     paginator = PageNumberPagination()
     paginator.page_size = 3

     posts = Post.objects.all().order_by("title")
     result_page = paginator.paginate_queryset(posts, request)
     serializer = PostSerializer(result_page, many=True, context={'request': request})

     return paginator.get_paginated_response(serializer.data)



@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def admin_post(request,slug):
    post=Post.objects.get(slug=slug)
    serializer=PostSerializer(post,context={'request': request})
    return Response(serializer.data,status=status.HTTP_200_OK)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def publish_post(request,slug):
    post=Post.objects.get(slug=slug)
    post.is_published=True
    serializer=PostSerializer(post,data=request.data,partial=True,context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_200_OK)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),

    ],
    responses={200: CommentSerializer(many=True)}
)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def admin_comments(request):
    paginator=PageNumberPagination()
    paginator.page_size=1

    comment=Comment.objects.all().order_by('-created_at')
    query_result=paginator.paginate_queryset(comment,request)
    serializer=CommentSerializer(query_result,many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def approve_comment(request,pk):
    comment=Comment.objects.get(pk=pk)
    comment.is_approved=True
    serializer=CommentSerializer(comment,data=request.data,partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_200_OK)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def delete_comment(request,pk):
    comment=Comment.objects.get(pk=pk)
    comment.delete()
    return Response({"message":"comment deleted successfully"})
@extend_schema(
    methods=['POST'],
    request=CategorySerializer,
    responses=CategorySerializer
)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_category(request):
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        # Save with the current user
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    methods=['POST'],
    request=TagSerializer,
    responses=TagSerializer
)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_tag(request):
    serializer = TagSerializer(data=request.data)
    if serializer.is_valid():
        # Save with the current user
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


















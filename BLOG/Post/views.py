from django.shortcuts import render
from Post.serializers import PostSerializer,TagSerializer,CategorySerializer,CommentSerializer
from rest_framework.decorators import api_view,authentication_classes,permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from Core.models import Post,Tag,Category,Comment
from django.shortcuts import get_object_or_404

#authentication

@extend_schema(
        methods=['POST','PATCH'],
        request=PostSerializer,
        responses=PostSerializer

)
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_post(request):

    serializer= PostSerializer(data=request.data,context={'request':request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def blog_list(request):
    post=Post.objects.filter(author=request.user)
    serializer=PostSerializer(post,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)


#Post

@extend_schema(
        methods=['PUT','PATCH'],
    request=PostSerializer,
    responses=PostSerializer
)
@api_view(['GET','PUT','PATCH','DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def blog_detail(request, slug):
    post = get_object_or_404(Post, author=request.user, slug=slug)

    if request.method == 'GET':
        serializer = PostSerializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = PostSerializer(instance=post, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        serializer=PostSerializer(instance=post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        post.delete()
        return Response({'message': 'Deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# Tag

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def tag_list(request):
    tag=Tag.objects.all()
    serializer=TagSerializer(tag,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_tag_slug(request,slug):
    tag=Tag.objects.filter(user=request.user,slug=slug)
    serializer=TagSerializer(tag,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_Post_tag_slug(request,slug):
    tag=get_object_or_404(Tag,slug=slug)
    post=Post.objects.filter(author=request.user,tag__in=[tag.id])
    serializer=PostSerializer(post,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

## category


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def category_list(request):
    category = Category.objects.all()
    serializer = CategorySerializer(category, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_category_slug(request, slug):
    category = Category.objects.filter(user=request.user, slug=slug)
    serializer = CategorySerializer(category, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_Post_category_slug(request,slug):
    category=get_object_or_404(Category,slug=slug)
    post=Post.objects.get(author=request.user,category=category)
    serializer=PostSerializer(post)
    return Response(serializer.data,status=status.HTTP_200_OK)

@extend_schema(
        methods=['POST'],
        request=CommentSerializer,
        responses=CommentSerializer
)
@api_view(['GET','POST'])
@authentication_classes([TokenAuthentication])
def comments(request,slug):
    if request.method=='POST':
        post=Post.objects.get(slug=slug)
        serializer=CommentSerializer(post,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    elif request.method== 'GET':
        post=Post.objects.get(slug=slug)
        comment=Comment.objects.filter(post=post)
        serializer=CommentSerializer(comment,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)









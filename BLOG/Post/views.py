from django.shortcuts import render
from Post.serializers import PostSerializer
from rest_framework.decorators import api_view,authentication_classes,permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from Core.models import Post
from django.shortcuts import get_object_or_404



@extend_schema(
        methods=['POST'],
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


@extend_schema(
        methods=['PUT'],
    request=PostSerializer,
    responses=PostSerializer
)
@api_view(['PUT','GET','DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def blog_detail(request,slug):
    post = get_object_or_404(Post, author=request.user, slug=slug)

    if request.method == 'GET':
        serializer=PostSerializer(post)
        return Response(serializer.data,status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer=PostSerializer(instance=post,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        post.delete()
        return Response({'message':'deleted successfully'})










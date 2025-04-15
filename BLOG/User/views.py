from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from rest_framework.decorators import api_view,renderer_classes,permission_classes,authentication_classes
from rest_framework import status
from rest_framework.response import Response
from user.serializers import UserSerializer,AuthTokenSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from drf_spectacular.utils import extend_schema
from rest_framework.authtoken.models import Token
from rest_framework.settings import api_settings


# Create your views here.
@extend_schema(
        methods=['POST'],
        request=UserSerializer,
        responses=UserSerializer

)

@api_view(['POST'])
def signup(request):
    serializer= UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    methods=['POST'],
    request=AuthTokenSerializer,
    responses=AuthTokenSerializer

)
@api_view(['POST'])
@renderer_classes(api_settings.DEFAULT_RENDERER_CLASSES)
def create_token(request):
    serializer = AuthTokenSerializer(data=request.data,context={'requst':request})
    if serializer.is_valid():
        user=serializer.validated_data['user']
        token,created= Token.objects.get_or_create(user=user)
        return Response({'token':token.key})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@extend_schema(
    methods=['PUT'],
    request=UserSerializer,
    responses=UserSerializer

)
@api_view(['GET','PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def manage_user(request):

    if request.method =='GET':
        serializer= UserSerializer(request.user)
        return Response(serializer.data,status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer= UserSerializer(request.user,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    request.user.auth_token.delete()
    return Response({'detail':"successfully logged out"},status=status.HTTP_204_NO_CONTENT)




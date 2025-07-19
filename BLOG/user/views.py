from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view,renderer_classes,permission_classes,authentication_classes
from rest_framework import status
from rest_framework.response import Response
from user.serializers import UserSerializer,AuthTokenSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema
from rest_framework.settings import api_settings
from django.contrib.auth import authenticate
from Core.models import User


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
    serializer = AuthTokenSerializer(data=request.data,context={'request':request})
    if serializer.is_valid():
        user=serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@extend_schema(
    methods=['GET', 'PUT', 'PATCH'],
    request=UserSerializer,
    responses=UserSerializer

)
@api_view(['GET','PUT','PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def manage_user(request):

    if request.method =='GET':
        serializer= UserSerializer(request.user)
        return Response(serializer.data,status=status.HTTP_200_OK)
    elif request.method in ['PUT', 'PATCH']:
        serializer= UserSerializer(request.user,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    methods=['POST'],
    request={
        'type': 'object',
        'properties': {
            'profile_image': {
                'type': 'string',
                'format': 'binary'
            }
        }
    },
    responses={200: UserSerializer}
)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def upload_profile_image(request):
    """Upload or update user profile image"""
    if 'profile_image' not in request.FILES:
        return Response({'error': 'No profile image provided'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = UserSerializer(request.user, data={'profile_image': request.FILES['profile_image']}, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@extend_schema(
    methods=["DELETE"],
    description="Logs out the current user by adding their JWT token to blacklist.",
    responses={204: None}
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'detail':"successfully logged out"},status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'detail':"Invalid token"},status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    methods=['GET'],
    responses=UserSerializer,
    description="Get user profile by username"
)
@api_view(['GET'])
def get_user_profile(request, username):
    """Get user profile by username"""
    try:
        user = get_object_or_404(User, username=username)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)




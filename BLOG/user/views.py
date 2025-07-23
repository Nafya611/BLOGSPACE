from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view,renderer_classes,permission_classes,authentication_classes
from rest_framework import status
from rest_framework.response import Response
from user.serializers import UserSerializer,AuthTokenSerializer,UserPreferencesSerializer,UserWithPreferencesSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema
from rest_framework.settings import api_settings
from django.contrib.auth import authenticate
from Core.models import User, UserPreferences


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


@extend_schema(
    methods=['GET', 'PUT', 'PATCH'],
    request=UserPreferencesSerializer,
    responses=UserPreferencesSerializer,
    description="Get or update user preferences"
)
@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_preferences(request):
    """Get or update user preferences"""
    try:
        # Get or create preferences for the user
        preferences = UserPreferences.get_or_create_for_user(request.user)

        if request.method == 'GET':
            serializer = UserPreferencesSerializer(preferences)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = UserPreferencesSerializer(
                preferences,
                data=request.data,
                partial=partial
            )

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(
            {'detail': f'Error managing preferences: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    methods=['POST'],
    description="Reset user preferences to default values"
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_user_preferences(request):
    """Reset user preferences to default values"""
    try:
        # Delete existing preferences (will be recreated with defaults)
        UserPreferences.objects.filter(user=request.user).delete()

        # Create new preferences with defaults
        preferences = UserPreferences.get_or_create_for_user(request.user)
        serializer = UserPreferencesSerializer(preferences)

        return Response({
            'message': 'Preferences reset to defaults successfully',
            'preferences': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'detail': f'Error resetting preferences: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    methods=['GET'],
    responses=UserWithPreferencesSerializer,
    description="Get user profile with preferences"
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_with_preferences(request):
    """Get complete user profile including preferences"""
    try:
        # Ensure preferences exist
        UserPreferences.get_or_create_for_user(request.user)

        # Serialize user with preferences
        serializer = UserWithPreferencesSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'detail': f'Error fetching profile: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    methods=['POST'],
    description="Bulk update multiple preference settings"
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_update_preferences(request):
    """Bulk update multiple preference settings at once"""
    try:
        preferences = UserPreferences.get_or_create_for_user(request.user)

        # Update only the provided fields
        for key, value in request.data.items():
            if hasattr(preferences, key):
                setattr(preferences, key, value)

        preferences.save()

        serializer = UserPreferencesSerializer(preferences)
        return Response({
            'message': 'Preferences updated successfully',
            'preferences': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'detail': f'Error updating preferences: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )




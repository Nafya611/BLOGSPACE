from  Core.models import User, UserPreferences
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth import (
    get_user_model


)
import cloudinary
import cloudinary.uploader
import os
import traceback

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True
)


class UserSerializer(serializers.ModelSerializer):
    """serializer for user authentication"""
    profile_image = serializers.ImageField(write_only=True, required=False)  # For uploads
    profile_image_url = serializers.URLField(source='profile_image', read_only=True)  # For display

    class Meta:
        model = get_user_model()
        fields=['id','username','first_name','last_name','email','password','profile_image','profile_image_url']
        extra_kwargs = {'password': {'write_only':True,'min_length':5}}
        read_only_fields= ['id','profile_image_url']

    def _upload_to_cloudinary(self, image_file):
        """Upload profile image to Cloudinary and return the URL"""
        try:
            if image_file:
                # Upload to Cloudinary with profile-specific folder
                result = cloudinary.uploader.upload(
                    image_file,
                    folder="profile_images",
                    resource_type="image",
                    transformation=[
                        {'width': 300, 'height': 300, 'crop': 'fill'},  # Square crop for profile images
                        {'quality': 'auto', 'fetch_format': 'auto'}
                    ]
                )
                print(f"Cloudinary profile image upload successful: {result['secure_url']}")
                return result['secure_url']
        except Exception as e:
            print(f"Cloudinary profile image upload error: {e}")
            traceback.print_exc()
        return None

    def create(self,validated_data):
        # Handle profile image upload
        profile_image_file = validated_data.pop('profile_image', None)
        user = get_user_model().objects.create_user(**validated_data)

        # Upload profile image if provided
        if profile_image_file:
            cloudinary_url = self._upload_to_cloudinary(profile_image_file)
            if cloudinary_url:
                user.profile_image = cloudinary_url
                user.save()

        return user

    def update(self,instance,validated_data):
        password = validated_data.pop('password',None)
        profile_image_file = validated_data.pop('profile_image', None)

        # Handle profile image upload
        if profile_image_file:
            cloudinary_url = self._upload_to_cloudinary(profile_image_file)
            if cloudinary_url:
                validated_data['profile_image'] = cloudinary_url

        user = super().update(instance,validated_data)

        if password:
            user.set_password(password)
            user.save()

        return user

class AuthTokenSerializer(serializers.Serializer):
    """serializer for user authentication"""
    email=serializers.EmailField()
    password=serializers.CharField(
        style={'input_type':'password'},
        trim_whitespace=False
    )
    def validate(self,attrs):
        email=attrs.get('email')
        password=attrs.get('password')
        user=authenticate(request=self.context.get('request'),username=email,password=password)
        if not user:
            msg='Unable to authenticate with provided credentials'
            raise serializers.ValidationError(msg,code='authentication')
        attrs['user']=user
        return attrs


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for user preferences"""

    class Meta:
        model = UserPreferences
        fields = [
            'theme', 'font_size', 'high_contrast', 'reduce_animations',
            'language', 'timezone', 'date_format', 'time_format',
            'posts_per_page', 'show_profile_image', 'auto_save_drafts',
            'show_online_status', 'email_notifications', 'browser_notifications',
            'marketing_emails', 'editor_theme', 'auto_preview', 'spell_check',
            'custom_preferences'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_posts_per_page(self, value):
        """Validate posts per page is within reasonable limits"""
        if value < 1 or value > 100:
            raise serializers.ValidationError("Posts per page must be between 1 and 100")
        return value

    def validate_theme(self, value):
        """Validate theme choice"""
        valid_themes = ['light', 'dark', 'auto']
        if value not in valid_themes:
            raise serializers.ValidationError(f"Theme must be one of: {', '.join(valid_themes)}")
        return value

    def validate_language(self, value):
        """Validate language choice"""
        valid_languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']
        if value not in valid_languages:
            raise serializers.ValidationError(f"Language must be one of: {', '.join(valid_languages)}")
        return value


class UserWithPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for user with embedded preferences"""
    preferences = UserPreferencesSerializer(read_only=True)

    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'profile_image_url', 'preferences']
        read_only_fields = ['id', 'profile_image_url']


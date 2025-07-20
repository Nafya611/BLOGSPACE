from rest_framework import serializers
from Core.models import Post,Tag,Category,Comment
from django.utils.text import slugify
import json
import os
import cloudinary
import cloudinary.uploader
from django.contrib.auth import get_user_model

User = get_user_model()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True
)


class TagSerializer(serializers.ModelSerializer):
     class Meta:
          model=Tag
          fields=['id','name','slug']
          read_only_fields= ['id', 'slug']

     def create(self, validated_data):
          # Auto-generate slug from name
          validated_data['slug'] = slugify(validated_data['name'])
          return super().create(validated_data)


class CategorySerializer(serializers.ModelSerializer):
     class Meta:
          model=Category
          fields=['id','name','slug']
          read_only_fields=['id', 'slug']

     def create(self, validated_data):
          # Auto-generate slug from name
          validated_data['slug'] = slugify(validated_data['name'])
          return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'profile_image']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    parent_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model=Comment
        fields=['id','content','created_at','is_approved','author','parent_id','replies']
        read_only_fields = ['id','created_at','is_approved','author','replies']

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.filter(is_approved=True).order_by('created_at'), many=True).data
        return []

class PostSerializer(serializers.ModelSerializer):
    tag = serializers.ListField(required=False, allow_empty=True)  # Accept raw data
    category = serializers.DictField(required=False, allow_null=True)  # Accept raw data
    author = UserSerializer(read_only=True)
    image = serializers.ImageField(write_only=True, required=False)  # For uploads
    image_url = serializers.URLField(source='image', read_only=True)  # For display
    video = serializers.FileField(write_only=True, required=False)  # For video uploads
    video_url = serializers.URLField(source='video', read_only=True)  # For display

    class Meta:
        model = Post
        fields = [ 'title', 'slug', 'content', 'image', 'image_url', 'video', 'video_url', 'tag', 'category', 'author','created_at', 'updated_at','is_published', 'is_draft']
        read_only_fields = [ 'author','slug', 'created_at', 'updated_at', 'image_url', 'video_url']

    def to_representation(self, instance):
        """Convert model instance to representation, handling Cloudinary image and video URLs"""
        data = super().to_representation(instance)

        # Remove the write-only fields from the response
        data.pop('image', None)
        data.pop('video', None)

        # Use nested serializers for reading
        if instance.category:
            data['category'] = CategorySerializer(instance.category).data
        else:
            data['category'] = None

        # Fix for ManyRelatedManager iteration issue
        tags = instance.tag.all()
        if tags:
            data['tag'] = TagSerializer(tags, many=True).data
        else:
            data['tag'] = []

        # The image_url and video_url fields will be automatically populated from the URLFields
        return data

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.partial:
            for field in self.fields.values():
                field.required = False

    def to_internal_value(self, data):
        """Convert incoming data, handling JSON strings from FormData"""
        print(f"DEBUG: Received data keys: {list(data.keys()) if hasattr(data, 'keys') else 'not dict-like'}")

        # Make a mutable copy of the data
        if hasattr(data, '_mutable'):
            data._mutable = True

        # Store parsed category and tags for later use
        self._parsed_category = None
        self._parsed_tags = []

        # Handle JSON strings for category and tag when sent via FormData
        if 'category' in data and isinstance(data['category'], str):
            print(f"DEBUG: Found category string: {repr(data['category'])}")
            try:
                self._parsed_category = json.loads(data['category'])
                print(f"DEBUG: Parsed category: {self._parsed_category}")
                # Remove from data to avoid validation errors
                data.pop('category', None)
            except (json.JSONDecodeError, TypeError):
                print(f"DEBUG: Failed to parse category as JSON, keeping as string")
                pass  # Keep as string if not valid JSON

        if 'tag' in data and isinstance(data['tag'], str):
            print(f"DEBUG: Found tag string: {repr(data['tag'])}")
            try:
                self._parsed_tags = json.loads(data['tag'])
                print(f"DEBUG: Parsed tag: {self._parsed_tags}")
                # Remove from data to avoid validation errors
                data.pop('tag', None)
            except (json.JSONDecodeError, TypeError):
                print(f"DEBUG: Failed to parse tag as JSON, keeping as string")
                pass  # Keep as string if not valid JSON

        # If category and tag are already parsed objects, store them
        if 'category' in data and isinstance(data['category'], dict):
            self._parsed_category = data.pop('category')

        if 'tag' in data and isinstance(data['tag'], list):
            self._parsed_tags = data.pop('tag')

        print(f"DEBUG: Stored - category: {self._parsed_category}, tag: {self._parsed_tags}")
        return super().to_internal_value(data)

    def _upload_to_cloudinary(self, file_obj, resource_type="auto"):
        """Upload file to Cloudinary and return the URL"""
        try:
            if file_obj:
                # Get the file content and name
                file_content = file_obj.read()
                file_name = getattr(file_obj, 'name', 'upload')

                # Determine folder based on resource type
                folder = "blog_videos" if resource_type == "video" else "blog_images"

                # Set timeout based on resource type - longer for videos
                timeout = 300 if resource_type == "video" else 60  # 5 minutes for videos, 1 minute for images

                result = cloudinary.uploader.upload(
                    file_content,
                    folder=folder,
                    public_id=f"post_{file_name}_{hash(file_content)}",
                    resource_type=resource_type,
                    timeout=timeout
                )
                print(f"Cloudinary upload successful: {result['secure_url']}")
                return result['secure_url']
        except Exception as e:
            print(f"Cloudinary upload error: {e}")
            import traceback
            traceback.print_exc()
        return None

    def _get_or_create_tags(self, tags, post):
        """Handle getting or creating tags"""
        auth_user = self.context['request'].user
        if not tags:
            return
        for tag_data in tags:
            # Create tag with proper slug if not provided
            if 'slug' not in tag_data and 'name' in tag_data:
                tag_data['slug'] = slugify(tag_data['name'])

            tag_obj, created = Tag.objects.get_or_create(
                user=auth_user,
                name=tag_data['name'],
                defaults={'slug': tag_data.get('slug', slugify(tag_data['name']))}
            )
            post.tag.add(tag_obj)


    def create(self, validated_data):
        print(f"DEBUG: create() method called with validated_data keys: {list(validated_data.keys())}")
        print(f"DEBUG: validated_data: {validated_data}")

        user = self.context['request'].user
        title = validated_data.get('title')
        slug = slugify(title)

        # Handle image upload to Cloudinary
        image_file = validated_data.pop('image', None)
        image_url = None
        if image_file:
            image_url = self._upload_to_cloudinary(image_file, "image")

        # Handle video upload to Cloudinary
        video_file = validated_data.pop('video', None)
        video_url = None
        if video_file:
            video_url = self._upload_to_cloudinary(video_file, "video")

        # Use the parsed data stored in to_internal_value
        categories = getattr(self, '_parsed_category', None)
        tags = getattr(self, '_parsed_tags', [])

        print(f"DEBUG: Using stored data - categories: {categories}, tags: {tags}")

        # Validate that category and tags are provided (since we made them optional for serializer validation)
        if not categories:
            raise serializers.ValidationError({"category": "This field is required."})
        if not tags:
            raise serializers.ValidationError({"tag": "This field is required."})

        # Remove category and tag from validated_data to avoid assignment errors
        validated_data.pop('category', None)
        validated_data.pop('tag', None)

        # Ensure uniqueness of slug
        original_slug = slug
        counter = 1
        while Post.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1

        # Create post
        post = Post.objects.create(
            author=user,
            slug=slug,
            **validated_data
        )

        # Set Cloudinary URLs if uploads were successful
        if image_url:
            post.image = image_url
        if video_url:
            post.video = video_url

        if image_url or video_url:
            post.save()

        # Handle category (single ForeignKey)
        if categories:
            # Create category with proper slug if not provided
            if 'slug' not in categories and 'name' in categories:
                categories['slug'] = slugify(categories['name'])

            category_obj, created = Category.objects.get_or_create(
                user=user,
                name=categories['name'],
                defaults={'slug': categories.get('slug', slugify(categories['name']))}
            )
            post.category = category_obj
            post.save()
            print(f"DEBUG: Category assigned: {category_obj}")

        # handle tags
        self._get_or_create_tags(tags, post)
        print(f"DEBUG: Tags assigned: {list(post.tag.all())}")

        return post

    def update(self, instance, validated_data):
        """Update post instance with validated data"""
        user = self.context['request'].user

        # Handle image upload to Cloudinary
        image_file = validated_data.pop('image', None)
        if image_file:
            image_url = self._upload_to_cloudinary(image_file, "image")
            if image_url:
                instance.image = image_url

        # Handle video upload to Cloudinary
        video_file = validated_data.pop('video', None)
        if video_file:
            video_url = self._upload_to_cloudinary(video_file, "video")
            if video_url:
                instance.video = video_url

        # Use the parsed data stored in to_internal_value
        categories = getattr(self, '_parsed_category', None)
        tags = getattr(self, '_parsed_tags', None)

        # Remove category and tag from validated_data to avoid assignment errors
        validated_data.pop('category', None)
        validated_data.pop('tag', None)

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Handle category update (single ForeignKey)
        if categories is not None:
            if categories:
                category_obj, _ = Category.objects.get_or_create(user=user, **categories)
                instance.category = category_obj
            else:
                instance.category = None

        # Handle tags update
        if tags is not None:
            instance.tag.clear()  # Clear existing tags
            if tags:
                self._get_or_create_tags(tags, instance)

        instance.save()
        return instance
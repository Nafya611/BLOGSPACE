from rest_framework import serializers
from Core.models import Post,Tag,Category
from django.utils.text import slugify


class TagSerializer(serializers.ModelSerializer):
     class Meta:
          model=Tag
          fields=['id','name','slug']
          read_only_fields= ['id']


class CategorySerializer(serializers.ModelSerializer):
     class Meta:
          model=Category
          fields=['id','name','slug']
          read_only_fields=['id']

class PostSerializer(serializers.ModelSerializer):
    tag = TagSerializer(many=True, required=False)
    category = CategorySerializer(required=False)

    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'content', 'tag', 'category', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.partial:
            for field in self.fields.values():
                field.required = False

    def _get_or_create_tags(self, tags, post):
        """Handle getting or creating tags"""
        auth_user = self.context['request'].user
        if not tags:
            return
        for tag in tags:
            tag_obj, _ = Tag.objects.get_or_create(user=auth_user, **tag)
            post.tag.add(tag_obj)  # use `post.tag` (not post.tags)

    def create(self, validated_data):
        user = self.context['request'].user
        title = validated_data.get('title')
        slug = slugify(title)

        # pop correct fields
        tags = validated_data.pop('tag', [])  # corrected 'tag' not 'tags'
        category_data = validated_data.pop('category', None)

        # Ensure uniqueness of slug
        original_slug = slug
        counter = 1
        while Post.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1

        # get or create category
        category_instance = None
        if category_data:
            category_instance, _ = Category.objects.get_or_create(user=user, **category_data)

        # Create post
        post = Post.objects.create(
            author=user,
            slug=slug,
            category=category_instance,
            **validated_data
        )

        # handle tags
        self._get_or_create_tags(tags, post)

        return post

from django.db import models
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager, PermissionsMixin)
from  BLOG import settings

# Create your models here

class UserManager(BaseUserManager):
    def create_user(self,email,password=None,**extra_field):
        if not email:
            raise ValueError('user must have email address')
        user=self.model(email=self.normalize_email(email),**extra_field)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self,email,password=None,**extra_field):
        user=self.create_user(email,password,**extra_field)
        user.is_staff=True
        user.is_superuser=True
        user.save(using=self._db)

        return user
    def get_by_natural_key(self, email):
        return self.get(email=email)



class User(AbstractBaseUser,PermissionsMixin):
    username = models.CharField(max_length=100)
    first_name= models.CharField(max_length=255)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=255,unique=True)
    password = models.CharField(max_length=100)
    profile_image = models.URLField(max_length=500, blank=True, null=True)  # Cloudinary URL for profile image
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(auto_now=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD= 'email'
    REQUIRED_FIELDS =[]


    def __str__(self):
        return self.username


class Category(models.Model):
    name=models.CharField(max_length=100)
    slug=models.SlugField(max_length=120)
    user=models.ForeignKey(User,on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name=models.CharField(max_length=100)
    slug=models.SlugField(max_length=120)
    user=models.ForeignKey(User,on_delete=models.CASCADE)

    def __str__(self):
        return self.name




class Post(models.Model):
    title=models.CharField(max_length=255)
    slug=models.SlugField(max_length=255)
    author=models.ForeignKey(User,on_delete=models.CASCADE)
    tag=models.ManyToManyField(Tag,related_name='posts',blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    content=models.TextField()
    image=models.URLField(max_length=500, blank=True, null=True)  # Changed to URLField for Cloudinary URLs
    video=models.URLField(max_length=500, blank=True, null=True)  # Added video field for Cloudinary video URLs
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    published_at=models.DateTimeField(auto_now_add=True)
    is_published=models.BooleanField(default=False)
    is_draft=models.BooleanField(default=False)

    def __str__(self):
        return self.slug

class Comment(models.Model):
    post=models.ForeignKey(Post,on_delete=models.CASCADE)
    author=models.ForeignKey(User,on_delete=models.CASCADE)
    parent=models.ForeignKey('self',on_delete=models.CASCADE,null=True,blank=True,related_name='replies')
    name=models.CharField(max_length=100,blank=True,null=True)
    email=models.EmailField(blank=True,null=True)
    content=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)
    is_approved=models.BooleanField(default=True)  # Comments approved by default

    def __str__(self):
        return self.content


class UserPreferences(models.Model):
    """
    Model to store user preferences like theme, language, UI settings, etc.
    This allows preferences to be synced across devices and sessions.
    """
    # UI Theme Preferences
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('auto', 'Auto (System)'),
    ]

    # Language Preferences
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('es', 'Spanish'),
        ('fr', 'French'),
        ('de', 'German'),
        ('it', 'Italian'),
        ('pt', 'Portuguese'),
        ('ru', 'Russian'),
        ('ja', 'Japanese'),
        ('ko', 'Korean'),
        ('zh', 'Chinese'),
    ]

    # Font Size Preferences
    FONT_SIZE_CHOICES = [
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
        ('extra_large', 'Extra Large'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')

    # Theme and UI Preferences
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    font_size = models.CharField(max_length=15, choices=FONT_SIZE_CHOICES, default='medium')
    high_contrast = models.BooleanField(default=False)
    reduce_animations = models.BooleanField(default=False)

    # Language and Localization
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='en')
    timezone = models.CharField(max_length=50, default='UTC')
    date_format = models.CharField(max_length=20, default='MM/DD/YYYY')
    time_format = models.CharField(max_length=10, default='12h')  # 12h or 24h

    # Content and Display Preferences
    posts_per_page = models.IntegerField(default=10)
    show_profile_image = models.BooleanField(default=True)
    auto_save_drafts = models.BooleanField(default=True)

    # Privacy and Notification Preferences
    show_online_status = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    browser_notifications = models.BooleanField(default=False)
    marketing_emails = models.BooleanField(default=False)

    # Editor Preferences
    editor_theme = models.CharField(max_length=20, default='default')  # for code/markdown editor
    auto_preview = models.BooleanField(default=True)
    spell_check = models.BooleanField(default=True)

    # Custom JSON field for additional preferences
    custom_preferences = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Preferences'
        verbose_name_plural = 'User Preferences'

    def __str__(self):
        return f"{self.user.username}'s Preferences"

    @classmethod
    def get_or_create_for_user(cls, user):
        """
        Get or create preferences for a user with default values
        """
        preferences, created = cls.objects.get_or_create(
            user=user,
            defaults={
                'theme': 'light',
                'language': 'en',
                'font_size': 'medium',
                'posts_per_page': 10,
                'timezone': 'UTC',
            }
        )
        return preferences

    def to_dict(self):
        """
        Convert preferences to dictionary for frontend consumption
        """
        return {
            'theme': self.theme,
            'font_size': self.font_size,
            'high_contrast': self.high_contrast,
            'reduce_animations': self.reduce_animations,
            'language': self.language,
            'timezone': self.timezone,
            'date_format': self.date_format,
            'time_format': self.time_format,
            'posts_per_page': self.posts_per_page,
            'show_profile_image': self.show_profile_image,
            'auto_save_drafts': self.auto_save_drafts,
            'show_online_status': self.show_online_status,
            'email_notifications': self.email_notifications,
            'browser_notifications': self.browser_notifications,
            'marketing_emails': self.marketing_emails,
            'editor_theme': self.editor_theme,
            'auto_preview': self.auto_preview,
            'spell_check': self.spell_check,
            'custom_preferences': self.custom_preferences,
        }




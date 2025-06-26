from django.db import models
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager, PermissionsMixin)
from  BLOG import settings

# Create your models here

class UserManger(BaseUserManager):
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
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(auto_now=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManger()

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
    image=models.ImageField(upload_to='post_images/', blank=True, null=True)
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
    name=models.CharField(max_length=100,blank=True,null=True)
    email=models.EmailField(blank=True,null=True)
    content=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)
    is_approved=models.BooleanField(default=False)

    def __str__(self):
        return self.content




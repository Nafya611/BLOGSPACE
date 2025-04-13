from django.db import models
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
    first_name= models.CharField(max_length=100)
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

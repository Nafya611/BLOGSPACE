from django.contrib import admin

# Register your models here.
from .models import User,Post,Tag,Category,Comment

admin.site.register(User)
admin.site.register(Post)
admin.site.register(Tag)
admin.site.register(Category)
admin.site.register(Comment)

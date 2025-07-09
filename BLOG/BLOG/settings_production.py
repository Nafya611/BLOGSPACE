"""
Production settings for Django deployment on Render
"""
import os
import dj_database_url
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY') or os.environ.get('FALLBACK_SECRET_KEY')

# Debug: Check SECRET_KEY
print(f"SECRET_KEY exists: {bool(SECRET_KEY)}")
if not SECRET_KEY:
    print("WARNING: SECRET_KEY is empty! Using hardcoded fallback key.")
    # Hardcoded fallback SECRET_KEY for development/testing (should be set properly in production)
    SECRET_KEY = 'django-insecure-fallback-key-for-development-only-change-in-production'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# Parse ALLOWED_HOSTS
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'Core',
    'user',
    'drf_spectacular',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'Post',
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'BLOG.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'BLOG.wsgi.application'

# Database - Use DATABASE_URL from environment with robust error handling
DATABASE_URL = os.environ.get('DATABASE_URL', '').strip()

# Debug: Print DATABASE_URL for troubleshooting (remove in production)
print(f"DATABASE_URL value: {repr(DATABASE_URL[:50])}..." if DATABASE_URL else "DATABASE_URL is empty")

# Clean up DATABASE_URL - remove any potential byte string artifacts
if DATABASE_URL:
    # Remove any potential b' prefix and trailing quotes
    DATABASE_URL = DATABASE_URL.strip("b'\"")
    DATABASE_URL = DATABASE_URL.replace("b'", "").replace("'", "")
    print(f"Cleaned DATABASE_URL: {repr(DATABASE_URL[:50])}...")

if DATABASE_URL and DATABASE_URL.strip():
    try:
        # Parse the database URL
        db_config = dj_database_url.parse(DATABASE_URL)
        DATABASES = {
            'default': db_config
        }
        print("Successfully parsed DATABASE_URL")
    except Exception as e:
        print(f"Error parsing DATABASE_URL: {e}")
        print(f"DATABASE_URL contents: {repr(DATABASE_URL)}")
        # Try to construct DATABASE_URL manually from individual components
        print("Attempting to construct DATABASE_URL from individual components...")
        try:
            db_name = os.environ.get('POSTGRES_DB', 'blogdb')
            db_user = os.environ.get('POSTGRES_USER', 'bloguser')
            db_password = os.environ.get('POSTGRES_PASSWORD', 'blogpass123')
            db_host = os.environ.get('DB_HOST', 'localhost')
            db_port = os.environ.get('DB_PORT', '5432')

            constructed_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
            print(f"Constructed DATABASE_URL: postgresql://{db_user}:***@{db_host}:{db_port}/{db_name}")

            DATABASES = {
                'default': dj_database_url.parse(constructed_url)
            }
            print("Successfully constructed and parsed DATABASE_URL from components")
        except Exception as e2:
            print(f"Error constructing DATABASE_URL: {e2}")
            # Final fallback database configuration
            DATABASES = {
                'default': {
                    'ENGINE': 'django.db.backends.postgresql',
                    'NAME': os.environ.get('POSTGRES_DB', 'blogdb'),
                    'USER': os.environ.get('POSTGRES_USER', 'bloguser'),
                    'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'blogpass123'),
                    'HOST': os.environ.get('DB_HOST', 'localhost'),
                    'PORT': os.environ.get('DB_PORT', '5432'),
                }
            }
else:
    print("DATABASE_URL is empty, constructing from individual components...")
    # Try to construct DATABASE_URL from individual components
    try:
        db_name = os.environ.get('POSTGRES_DB', 'blogdb')
        db_user = os.environ.get('POSTGRES_USER', 'bloguser')
        db_password = os.environ.get('POSTGRES_PASSWORD', 'blogpass123')
        db_host = os.environ.get('DB_HOST', 'localhost')
        db_port = os.environ.get('DB_PORT', '5432')

        if db_password != 'blogpass123':  # Only if we have real database credentials
            constructed_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
            print(f"Constructed DATABASE_URL: postgresql://{db_user}:***@{db_host}:{db_port}/{db_name}")

            DATABASES = {
                'default': dj_database_url.parse(constructed_url)
            }
            print("Successfully constructed and parsed DATABASE_URL from components")
        else:
            raise Exception("Using fallback configuration")
    except Exception as e:
        print(f"Error constructing DATABASE_URL: {e}")
        # Final fallback database configuration
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': os.environ.get('POSTGRES_DB', 'blogdb'),
                'USER': os.environ.get('POSTGRES_USER', 'bloguser'),
                'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'blogpass123'),
                'HOST': os.environ.get('DB_HOST', 'localhost'),
                'PORT': os.environ.get('DB_PORT', '5432'),
            }
        }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'Core.User'

# Django Sites Framework
SITE_ID = 1

# Authentication backends
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 3
}

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=60),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# Spectacular settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'Blog API',
    'VERSION': '1.0.0',
    'SWAGGER_UI_SETTINGS': {
        'persistAuthorization': True,
    },
    'COMPONENTS': {
        'securitySchemes': {
            'BearerAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT',
                'description': 'JWT authentication: Bearer <your-token>',
            }
        }
    },
    'SECURITY': [{'BearerAuth': []}],
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://blogspace-iota.vercel.app/",  # Replace with your actual Vercel URL after deployment
    "http://localhost:3000",
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True

# Allow all origins during development and initial deployment
if DEBUG or os.environ.get('ALLOW_ALL_ORIGINS', 'false').lower() == 'true':
    CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Allauth settings
ACCOUNT_EMAIL_VERIFICATION = 'none'
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_USER_MODEL_EMAIL_FIELD = 'email'
ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email', 'password1', 'password2']

# Social account settings
SOCIALACCOUNT_EMAIL_REQUIRED = True
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_QUERY_EMAIL = True

# Google OAuth credentials
GOOGLE_OAUTH_CLIENT_ID = os.environ.get('GOOGLE_OAUTH_CLIENT_ID', '')
GOOGLE_OAUTH_CLIENT_SECRET = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET', '')
GOOGLE_OAUTH_REDIRECT_URI = os.environ.get('GOOGLE_OAUTH_REDIRECT_URI', '')

# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_HSTS_SECONDS = 86400
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

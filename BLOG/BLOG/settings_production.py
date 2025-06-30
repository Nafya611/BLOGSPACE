"""
Production settings for BLOG project on Render.
"""

from pathlib import Path
import os

# Try to import dj_database_url, but don't fail if it's not available
try:
    import dj_database_url
except ImportError:
    dj_database_url = None

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fs2f%q(a2l+l7npk*@-882m2mqu50i)=c_u=#*7zo2ty&uj6!d')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes')

# Parse ALLOWED_HOSTS from environment variable
allowed_hosts_env = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1,0.0.0.0,.onrender.com')
ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_env.split(',')]

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
    'rest_framework.authtoken',
    'Post',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # For static files on Render
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
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

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    try:
        if dj_database_url:
            # Use dj_database_url if available and URL is valid
            DATABASES = {
                'default': dj_database_url.parse(DATABASE_URL)
            }
        else:
            raise ValueError("dj_database_url not available")
    except (ValueError, Exception) as e:
        # Fallback to manual parsing if dj_database_url fails
        print(f"Warning: dj_database_url failed ({e}), using manual parsing")
        try:
            import urllib.parse as urlparse
            url = urlparse.urlparse(DATABASE_URL)

            # Debug the parsed URL components (avoid accessing url.port directly as it can cause the error)
            print(f"Debug - URL components: scheme={url.scheme}, hostname={url.hostname}, path={url.path}")
            print(f"Debug - Raw URL: {DATABASE_URL[:50]}...")  # Show first 50 chars for debugging

            # Extract port with more robust parsing
            try:
                # Try to get port directly first, but catch the ValueError
                port = url.port
                if port is None:
                    port = 5432
                elif isinstance(port, str):
                    port = int(port)
            except ValueError as port_error:
                print(f"Port parsing error: {port_error}")
                # Fallback: try to extract port from netloc manually
                try:
                    if ':' in url.netloc:
                        # Split hostname:port
                        netloc_parts = url.netloc.split(':')
                        if len(netloc_parts) >= 2:
                            port_str = netloc_parts[-1]  # Get last part after ':'
                            # Remove any extra characters that might be there
                            port_str = ''.join(filter(str.isdigit, port_str))
                            port = int(port_str) if port_str else 5432
                        else:
                            port = 5432
                    else:
                        port = 5432
                except (ValueError, IndexError):
                    print("Manual port extraction failed, using default 5432")
                    port = 5432

            DATABASES = {
                'default': {
                    'ENGINE': 'django.db.backends.postgresql',
                    'NAME': url.path[1:] if url.path else '',
                    'USER': url.username or '',
                    'PASSWORD': url.password or '',
                    'HOST': url.hostname or 'localhost',
                    'PORT': port if port is not None else 5432,
                    'OPTIONS': {
                        'connect_timeout': 60,
                    },
                }
            }
            print(f"Database configured: {DATABASES['default']['HOST']}:{DATABASES['default']['PORT']}")
        except Exception as parse_error:
            print(f"Error parsing DATABASE_URL: {parse_error}")
            # Final fallback to SQLite
            DATABASES = {
                'default': {
                    'ENGINE': 'django.db.backends.sqlite3',
                    'NAME': BASE_DIR / 'db.sqlite3',
                }
            }
else:
    # No DATABASE_URL provided, use SQLite for local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
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
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Configure WhiteNoise for static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'Core.User'

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Spectacular settings for API documentation
SPECTACULAR_SETTINGS = {
    'TITLE': 'Blog API',
    'VERSION': '1.0.0',
    'SWAGGER_UI_SETTINGS': {
        'persistAuthorization': True,
    },
    'COMPONENTS': {
        'securitySchemes': {
            'TokenAuth': {
                'type': 'apiKey',
                'in': 'header',
                'name': 'Authorization',
                'description': 'Token-based authentication: Token <your-token>',
            }
        }
    },
    'SECURITY': [{'TokenAuth': []}],
}

# CORS settings for frontend integration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Add your frontend domain when deployed
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
if FRONTEND_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

CORS_ALLOW_CREDENTIALS = True

# Allow all origins during development only
if DEBUG:
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

# Security settings for production
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 86400
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

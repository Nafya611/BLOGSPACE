"""
WSGI config for BLOG project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Check if DJANGO_SETTINGS_MODULE is already set
if not os.environ.get('DJANGO_SETTINGS_MODULE'):
    # Use production settings if RENDER environment variable is set
    if os.environ.get('RENDER'):
        os.environ['DJANGO_SETTINGS_MODULE'] = 'BLOG.settings_simple'
    else:
        os.environ['DJANGO_SETTINGS_MODULE'] = 'BLOG.settings'

application = get_wsgi_application()

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint for deployment monitoring"""
    return JsonResponse({
        "status": "healthy",
        "message": "Blog API is running",
        "version": "1.0.0"
    })

@csrf_exempt
@require_http_methods(["GET"])
def api_info(request):
    """API information endpoint"""
    return JsonResponse({
        "name": "Blog API",
        "version": "1.0.0",
        "description": "REST API for blog platform with user authentication and image uploads",
        "endpoints": {
            "auth": "/api/user/",
            "posts": "/api/Post/",
            "docs": "/api/docs/",
            "schema": "/api/schema/"
        }
    })

# BLOG_API

A Django REST API backend for a blog platform, supporting user authentication, post management, categories, tags, and comments. Designed for easy integration with any frontend (React, Vue, Angular, etc.).

## Features
- Custom user model with email authentication
- Token-based authentication (DRF)
- CRUD for posts, categories, tags
- Moderated comments (with approval)
- Admin endpoints for content management
- Public endpoints for frontend blog display
- CORS support for frontend integration

## Project Structure
```
BLOG_API/
├── BLOG/
│   ├── Core/         # User, Post, Category, Tag, Comment models
│   ├── Post/         # Post-related API views, serializers, urls
│   ├── user/         # User registration, login, profile
│   ├── BLOG/         # Django project settings, urls
│   └── manage.py
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/user/signup/` — Register
- `POST /api/user/token/` — Login (get token)
- `GET /api/user/me` — Get/update user profile
- `DELETE /api/user/logout/` — Logout

### Public Blog (No Auth Required)
- `GET /api/Post/public/posts/` — List published posts
- `GET /api/Post/public/post/<slug>/` — Post detail
- `GET /api/Post/public/categories/` — List categories
- `GET /api/Post/public/tags/` — List tags
- `GET /api/Post/public/category/<slug>/posts/` — Posts by category
- `GET /api/Post/public/tag/<slug>/posts/` — Posts by tag
- `GET /api/Post/public/post/<slug>/comments/` — Approved comments
- `POST /api/Post/public/post/<slug>/add-comment/` — Add comment (anonymous allowed)

### Authenticated User
- `GET /api/Post/blog_list/` — User's posts
- `POST /api/Post/post_blog/` — Create post
- `GET/PUT/DELETE /api/Post/blog_detail/<slug>/` — Manage post
- `GET /api/Post/tag_list/` — User's tags
- `GET /api/Post/category_list/` — User's categories

### Admin
- `GET /api/Post/admin/posts/` — All posts
- `PUT /api/Post/admin/publish_post/<slug>/` — Publish post
- `GET /api/Post/admin/comments` — All comments
- `PUT /api/Post/admin/approve_comment/<pk>` — Approve comment
- `DELETE /api/Post/admin/delete_comment/<pk>` — Delete comment

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Configure database:**
   - Edit `BLOG/BLOG/settings.py` for your DB (PostgreSQL by default)
3. **Run migrations:**
   ```bash
   python manage.py migrate
   ```
4. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```
5. **Run server:**
   ```bash
   python manage.py runserver
   ```

## Docker
- To run with Docker Compose:
  ```bash
  docker-compose up
  ```

## CORS
- CORS is enabled for common frontend dev ports (see `settings.py`).

## API Docs
- Swagger UI: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- OpenAPI: [http://localhost:8000/api/schema/](http://localhost:8000/api/schema/)



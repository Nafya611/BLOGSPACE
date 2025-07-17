# Cloudinary Integration Setup

This project uses Cloudinary for image storage and management. Follow these steps to set up Cloudinary integration:

## 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com) and sign up for a free account
2. After registration, you'll be taken to your dashboard
3. Note down your **Cloud Name**, **API Key**, and **API Secret** from the dashboard

## 2. Configure Environment Variables

Update your `.env` file with your Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

**Important:** Replace the placeholder values with your actual Cloudinary credentials from your dashboard.

## 3. Install Dependencies

The required packages are already included in `requirements.txt`:
- `django-cloudinary-storage>=0.3.0`

## 4. Build and Run with Docker

After updating your `.env` file:

```bash
# Stop existing containers
docker-compose down

# Rebuild containers with new dependencies
docker-compose build --no-cache

# Start the containers
docker-compose up -d

# Run migrations (if needed)
docker-compose exec app python manage.py makemigrations
docker-compose exec app python manage.py migrate
```

## 5. Features

With Cloudinary integration, your blog will have:

- **Automatic image optimization** - Images are automatically optimized for web delivery
- **Responsive images** - Different sizes for different devices
- **Global CDN** - Fast image delivery worldwide
- **Image transformations** - Automatic resizing, cropping, and format conversion
- **Free storage** - Generous free tier with paid options for scaling

## 6. How It Works

- **Upload**: When users upload images through the blog interface, they're automatically uploaded to Cloudinary
- **Storage**: Images are stored in your Cloudinary cloud storage, not on your server
- **Delivery**: Images are delivered through Cloudinary's global CDN for optimal performance
- **URLs**: Image URLs are automatically generated and managed by Cloudinary

## 7. Benefits

- **Performance**: Faster image loading with global CDN
- **Storage**: No local storage needed for images
- **Scalability**: Handles unlimited images
- **Optimization**: Automatic image optimization and format selection
- **Reliability**: Enterprise-grade image storage and delivery

## 8. Environment Configuration

The application is configured to:
- Use Cloudinary for all image uploads in production
- Fallback to local storage if Cloudinary credentials are not provided
- Automatically handle image URL generation
- Support both local development and production deployment

## 9. Troubleshooting

If images aren't uploading:
1. Check that your Cloudinary credentials are correct in `.env`
2. Ensure the containers are rebuilt after adding credentials
3. Check the Django logs for any Cloudinary-related errors
4. Verify your Cloudinary account limits haven't been exceeded

## 10. Next Steps

After setup:
- Test image uploads through the blog interface
- Monitor usage in your Cloudinary dashboard
- Consider upgrading your Cloudinary plan as your blog grows
- Explore advanced Cloudinary features like image transformations

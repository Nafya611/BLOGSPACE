# Blog API Deployment Guide

This guide will help you deploy your Django Blog API to Render (backend) and Vercel (frontend).

## Prerequisites

1. GitHub account
2. Render account (render.com)
3. Vercel account (vercel.com)
4. Google OAuth credentials configured

## Step 1: Prepare for Deployment

1. **Commit all changes to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

## Step 2: Deploy Backend on Render

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Render will automatically detect the `render.yaml` file and create:**
   - Web service (Django backend)
   - PostgreSQL database
5. **Set environment variables** (if not auto-detected):
   - `GOOGLE_OAUTH_CLIENT_SECRET`: Your Google OAuth client secret
   - Update `ALLOWED_HOSTS` with your actual Render URL
6. **Wait for deployment to complete**
7. **Copy your backend URL:** `https://blog-backend.onrender.com`

## Step 3: Update Google OAuth Settings

1. **Go to Google Cloud Console:** https://console.cloud.google.com/
2. **Navigate to APIs & Services → Credentials**
3. **Edit your OAuth 2.0 Client**
4. **Add authorized redirect URI:**
   ```
   https://your-backend-name.onrender.com/api/user/google-callback/
   ```
5. **Save changes**

## Step 4: Deploy Frontend on Vercel

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure project settings:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Add environment variable:**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend-name.onrender.com`
6. **Deploy**
7. **Copy your frontend URL:** `https://your-frontend.vercel.app`

## Step 5: Update CORS Settings

1. **Go back to Render dashboard**
2. **Update environment variable `ALLOWED_HOSTS`:**
   ```
   your-backend-name.onrender.com,your-frontend.vercel.app
   ```
3. **In `settings_production.py`, update `CORS_ALLOWED_ORIGINS`:**
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://your-frontend.vercel.app",
   ]
   ```
4. **Commit and push changes**

## Step 6: Test Deployment

1. **Visit your frontend URL**
2. **Test authentication with Google OAuth**
3. **Create a blog post with image upload**
4. **Verify all functionality works**

## Environment Variables Summary

### Backend (Render)
- `DEBUG=False`
- `SECRET_KEY` (auto-generated)
- `ALLOWED_HOSTS=your-backend-name.onrender.com`
- `DATABASE_URL` (auto-configured)
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI=https://your-backend-name.onrender.com/api/user/google-callback/`

### Frontend (Vercel)
- `VITE_API_URL=https://your-backend-name.onrender.com`

## Troubleshooting

### Backend Issues
- Check Render logs for deployment errors
- Verify environment variables are set correctly
- Ensure database migrations ran successfully

### Frontend Issues
- Check browser console for API errors
- Verify `VITE_API_URL` is set correctly
- Check network tab for failed requests

### OAuth Issues
- Verify redirect URIs in Google Cloud Console
- Check `GOOGLE_OAUTH_REDIRECT_URI` environment variable
- Test OAuth flow in browser

## Files Created for Deployment

1. `render.yaml` - Render deployment configuration
2. `BLOG/BLOG/settings_production.py` - Production Django settings
3. `Dockerfile` - Updated for production deployment
4. `requirements.txt` - Updated with production dependencies

## Security Notes

1. Never commit sensitive environment variables to GitHub
2. Use Render's environment variable management
3. Keep Google OAuth credentials secure
4. Regularly update dependencies

## Support

If you encounter issues:
1. Check Render and Vercel logs
2. Verify all environment variables
3. Test locally with production settings
4. Review CORS and OAuth configurations

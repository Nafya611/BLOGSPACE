# Frontend Deployment Guide

## Prerequisites

1. **Backend is deployed and running**: `https://blogspace-vuer.onrender.com`
2. **Google OAuth is configured** in the backend with correct credentials
3. **GitHub repository** with the frontend code

## Step 1: Prepare Frontend for Production

1. **Update environment variables** in `frontend/.env`:
   ```env
   VITE_API_URL=https://blogspace-vuer.onrender.com
   ```

2. **Test the build locally**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

## Step 2: Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Connect your GitHub repository
4. Select the `frontend` folder as the root directory
5. Set environment variables:
   - `VITE_API_URL`: `https://blogspace-vuer.onrender.com`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the frontend directory:
   ```bash
   cd frontend
   vercel --prod
   ```

4. Follow the prompts and set environment variables when asked

## Step 3: Update Backend CORS Settings

After deployment, update the backend's CORS settings:

1. **Get your Vercel URL** (e.g., `https://your-app.vercel.app`)

2. **Update backend settings** in `BLOG/BLOG/settings_production.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://your-app.vercel.app",  # Your actual Vercel URL
       "http://localhost:5173",
       "http://localhost:5173",
   ]
   ```

3. **Commit and push** the changes to trigger a backend redeploy

## Step 4: Update Google OAuth Settings

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to APIs & Services → Credentials**
3. **Edit your OAuth 2.0 Client**
4. **Add authorized redirect URIs**:
   ```
   https://blogspace-vuer.onrender.com/api/user/google-callback/
   ```
5. **Save changes**

## Step 5: Test the Application

1. **Visit your deployed frontend URL**
2. **Test Google OAuth login**
3. **Test creating and viewing blog posts**
4. **Test image uploads**

## Environment Variables Summary

### Backend (Render)
- `GOOGLE_OAUTH_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_OAUTH_CLIENT_SECRET`: Your Google OAuth client secret
- `GOOGLE_OAUTH_REDIRECT_URI`: `https://blogspace-vuer.onrender.com/api/user/google-callback/`
- `ALLOW_ALL_ORIGINS`: `true` (for initial deployment, set to `false` later)

### Frontend (Vercel)
- `VITE_API_URL`: `https://blogspace-vuer.onrender.com`

## Troubleshooting

### CORS Issues
- Make sure `ALLOW_ALL_ORIGINS=true` is set in backend
- Check that the frontend URL is added to `CORS_ALLOWED_ORIGINS`

### Google OAuth Issues
- Verify redirect URI is correctly set in Google Cloud Console
- Check that Google OAuth credentials are set in Render dashboard

### API Connection Issues
- Verify `VITE_API_URL` is set correctly
- Check that the backend is running and accessible

## Security Notes

After successful deployment:
1. Set `ALLOW_ALL_ORIGINS=false` in backend
2. Add your specific frontend URL to `CORS_ALLOWED_ORIGINS`
3. Ensure all OAuth redirect URIs are properly configured

# Google OAuth Setup Guide

This guide will help you properly set up Google OAuth for your blog application in both local development and production environments.

## Google Cloud Console Configuration

1. **Create a project in Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"

2. **Configure the OAuth consent screen**:
   - Go to "OAuth consent screen"
   - Select "External" user type (or "Internal" if you're using Google Workspace)
   - Fill in the required information:
     - App name: BlogSpace
     - User support email: [your email]
     - Developer contact information: [your email]
   - Add scopes: `.../auth/userinfo.email` and `.../auth/userinfo.profile`
   - Add test users if you're not verifying your app

3. **Create OAuth client ID**:
   - Go to "Credentials" > "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add a name: "BlogSpace Web Client"
   - Add authorized JavaScript origins:
     - For development: `http://localhost:3000`
     - For production: `https://blogspace-vuer-frontend.onrender.com`
   - Add authorized redirect URIs:
     - For development: `http://localhost:8000/api/user/google-callback/` and `http://localhost:8000/api/user/google-callback-test/`
     - For production: `https://blogspace-vuer.onrender.com/api/user/google-callback/` and `https://blogspace-vuer.onrender.com/api/user/google-callback-test/`
   - Click "Create"
   - Copy the Client ID and Client Secret for the next steps

## Local Development Environment Configuration

1. **Update the `.env` file in the backend directory**:

   ```env
   # Google OAuth Configuration
   GOOGLE_OAUTH_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_OAUTH_CLIENT_SECRET="your-client-secret"
   GOOGLE_OAUTH_REDIRECT_URI="http://localhost:8000/api/user/google-callback/"

   # Frontend URL for callbacks
   FRONTEND_URL="http://localhost:3000"
   FRONTEND_CALLBACK_PATH="/auth/callback"
   ```

2. **Update the `.env` file in the frontend directory**:

   ```env
   VITE_API_URL=http://localhost:8000
   VITE_FRONTEND_URL=http://localhost:3000
   VITE_GOOGLE_CALLBACK_PATH=/auth/callback
   ```

## Production Environment Configuration (Render)

1. **Set environment variables in Render dashboard for the backend service**:
   - `GOOGLE_OAUTH_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_OAUTH_CLIENT_SECRET`: Your Google OAuth client secret
   - `GOOGLE_OAUTH_REDIRECT_URI`: `https://blogspace-vuer.onrender.com/api/user/google-callback/`
   - `FRONTEND_URL`: `https://blogspace-vuer-frontend.onrender.com`
   - `FRONTEND_CALLBACK_PATH`: `/auth/callback`

2. **Set environment variables in Render dashboard for the frontend service**:
   - `VITE_API_URL`: `https://blogspace-vuer.onrender.com`
   - `VITE_FRONTEND_URL`: `https://blogspace-vuer-frontend.onrender.com`
   - `VITE_GOOGLE_CALLBACK_PATH`: `/auth/callback`

## Troubleshooting

If you encounter issues with Google OAuth authentication, you can use the built-in diagnostic tools:

1. **Backend Test Endpoint**:
   - Visit `http://localhost:8000/api/user/google-test/` (local) or `https://blogspace-vuer.onrender.com/api/user/google-test/` (production)
   - This will provide detailed information about your Google OAuth configuration

2. **Frontend Diagnostic Tool**:
   - Visit `http://localhost:3000/oauth-diagnostic` (local) or `https://blogspace-vuer-frontend.onrender.com/oauth-diagnostic` (production)
   - This tool tests the OAuth endpoints and displays helpful debugging information

3. **Common Issues**:
   - **"Error: redirect_uri_mismatch"**: The redirect URI in your request doesn't match the ones authorized in Google Cloud Console
   - **"Missing required parameter: client_id"**: Client ID is not properly set in environment variables
   - **"The JavaScript origin in the request does not match the ones authorized"**: The frontend URL is not added to authorized JavaScript origins

Remember to restart your services after making changes to environment variables.

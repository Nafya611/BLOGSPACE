# Blog Frontend

This is a React frontend application built with Vite that connects to the Django REST API backend.

## Features

- User authentication with Google OAuth
- Create, read, update, and delete blog posts
- Image upload for posts
- Responsive design
- JWT token-based authentication

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Django backend server (deployed at https://blogspace-vuer.onrender.com)

## Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_API_URL=https://blogspace-vuer.onrender.com
```

For local development, use:
```env
VITE_API_URL=http://localhost:8000
```

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   copy .env.example .env
   ```

4. Update the `.env` file with your Django API URL if different from default:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
src/
├── components/          # React components
│   ├── BlogList.jsx    # Blog posts listing component
│   └── BlogList.css    # Blog component styles
├── config/             # Configuration files
│   └── api.js         # API endpoints configuration
├── services/          # API service functions
│   ├── apiClient.js   # Axios configuration
│   └── blogApi.js     # Blog API functions
├── App.jsx            # Main App component
├── App.css            # App styles
└── main.jsx           # Entry point
```

## API Integration

The frontend connects to the Django backend through:

- **API Base URL**: `http://localhost:8000` (configurable via `.env`)
- **Posts Endpoint**: `/api/Post/blog_list/`
- **Post Detail**: `/api/Post/blog_detail/{slug}/`
- **Categories**: `/api/Post/category_list/`
- **Tags**: `/api/Post/tag_list/`
- **Comments**: `/api/Post/post/{slug}/read_comments`

## Features

- ✅ Display blog posts from Django API
- ✅ Responsive design
- ✅ Error handling and loading states
- ✅ CORS configured for development
- 🔄 Authentication (ready for implementation)
- 🔄 Create/Edit posts (ready for implementation)
- 🔄 Comments system (ready for implementation)

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Make sure the Django backend is running
2. Verify CORS is configured in Django settings
3. Check that `ALLOWED_HOSTS` includes your frontend domain

### API Connection Issues
1. Verify Django server is running on `http://localhost:8000`
2. Check the `.env` file has the correct `REACT_APP_API_URL`
3. Ensure Django API endpoints are accessible

### Development Issues
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check browser console for detailed error messages+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

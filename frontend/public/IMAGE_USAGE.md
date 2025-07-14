# Image Usage Guide

## Folder Structure
```
frontend/public/
├── images/          # General images (photos, banners, etc.)
├── icons/           # Icons and small graphics
└── vite.svg         # Root level images
```

## How to Use Images in Components

### 1. Images in public/images/ folder
```jsx
// For images in public/images/
<img src="/images/logo.png" alt="Logo" />
<img src="/images/hero-banner.jpg" alt="Hero Banner" />
<img src="/images/profile-avatar.png" alt="Profile" />
```

### 2. Icons in public/icons/ folder
```jsx
// For icons in public/icons/
<img src="/icons/google-icon.svg" alt="Google" />
<img src="/icons/user-icon.png" alt="User" />
```

### 3. Root level images
```jsx
// For images directly in public/
<img src="/vite.svg" alt="Vite" />
<img src="/favicon.ico" alt="Favicon" />
```

## Image Optimization Tips

1. **Use appropriate formats:**
   - PNG for logos and graphics with transparency
   - JPG for photos
   - SVG for icons and simple graphics
   - WebP for modern browsers (smaller file size)

2. **Optimize file sizes:**
   - Compress images before adding them
   - Use appropriate dimensions
   - Consider using CDN for large images

3. **File naming:**
   - Use kebab-case: `hero-banner.jpg`
   - Be descriptive: `user-profile-avatar.png`
   - Include size if needed: `logo-small.png`, `logo-large.png`

## Examples

### Blog Post Images
```jsx
function BlogPost({ post }) {
  return (
    <article>
      <img
        src={`/images/${post.image}`}
        alt={post.title}
        style={{ width: '100%', height: 'auto' }}
      />
      <h2>{post.title}</h2>
      <p>{post.content}</p>
    </article>
  );
}
```

### User Avatar
```jsx
function UserAvatar({ user }) {
  const defaultAvatar = "/icons/default-avatar.png";
  const userAvatar = user.avatar ? `/images/${user.avatar}` : defaultAvatar;

  return (
    <img
      src={userAvatar}
      alt={`${user.name}'s avatar`}
      style={{ width: '40px', height: '40px', borderRadius: '50%' }}
    />
  );
}
```

### Google Login Button
```jsx
function GoogleLoginButton() {
  return (
    <button className="google-login">
      <img src="/icons/google-icon.svg" alt="Google" width="20" height="20" />
      Sign in with Google
    </button>
  );
}
```

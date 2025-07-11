import React from 'react';

const ImageTest = () => {
  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', margin: '20px', borderRadius: '8px' }}>
      <h3>Image Test Component</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>Images from /images/ folder:</h4>
        <img
          src="/images/sample-image.svg"
          alt="Sample Image"
          style={{ display: 'block', marginBottom: '10px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Icons from /icons/ folder:</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <img src="/icons/google-icon.svg" alt="Google" width="24" height="24" />
          <span>Google Icon</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
          <img src="/icons/user-icon.svg" alt="User" width="24" height="24" />
          <span>User Icon</span>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Root level image:</h4>
        <img src="/vite.svg" alt="Vite" width="32" height="32" />
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
        <strong>Usage in your components:</strong>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
{`// For general images
<img src="/images/your-image.png" alt="Description" />

// For icons
<img src="/icons/your-icon.svg" alt="Icon" width="24" height="24" />

// For root level images
<img src="/favicon.ico" alt="Favicon" />`}
        </pre>
      </div>
    </div>
  );
};

export default ImageTest;

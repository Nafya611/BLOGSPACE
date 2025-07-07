import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const GoogleCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from the URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');

        if (!code) {
          setError('No authorization code found');
          setLoading(false);
          return;
        }

        // Exchange the code for tokens
        const response = await axios.post('/api/user/google-auth/', { code });

        // Save tokens to localStorage
        localStorage.setItem('accessToken', response.data.access_token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Google OAuth error:', error);
        setError(error.response?.data?.error || 'Authentication failed');
        setLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Authenticating with Google...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: 'red'
      }}>
        <p>Error: {error}</p>
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;

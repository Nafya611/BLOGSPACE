import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const params = new URLSearchParams(location.search);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const user_id = params.get('user_id');
        const email = params.get('email');
        const error_param = params.get('error');

        if (error_param) {
          setError(`Google OAuth error: ${error_param}`);
          setLoading(false);
          return;
        }

        if (!access_token || !refresh_token) {
          setError('Missing authentication tokens');
          setLoading(false);
          return;
        }

        // Save tokens to localStorage
        localStorage.setItem('authToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        localStorage.setItem('user', JSON.stringify({ id: user_id, email: email }));

        // Redirect to dashboard
        navigate('/dashboard');

      } catch (error) {
        console.error('Google OAuth error:', error);
        setError('Authentication failed');
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

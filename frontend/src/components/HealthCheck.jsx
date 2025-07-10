import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HealthCheck = () => {
  const [apiStatus, setApiStatus] = useState('checking');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        console.log('Checking API health...');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        console.log('API Base URL:', baseUrl);

        // Create a simple axios instance without authentication for health check
        const healthResponse = await axios.get(`${baseUrl}/health/`, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log('API Health Response:', healthResponse);
        setApiStatus('connected');
      } catch (error) {
        console.error('API Health Check Failed:', error);
        setApiStatus('failed');

        // More detailed error information
        if (error.response) {
          setErrorMessage(`Status: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
          setErrorMessage('Network error - Could not reach the server');
        } else {
          setErrorMessage(error.message || 'Unknown error');
        }
      }
    };

    checkApiHealth();
  }, []);

  const statusStyles = {
    checking: { color: 'orange' },
    connected: { color: 'green' },
    failed: { color: 'red' }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', backgroundColor: '#f9f9f9' }}>
      <h3>API Connection Status</h3>
      <p>Backend URL: {import.meta.env.VITE_API_URL}</p>
      <p style={statusStyles[apiStatus]}>
        Status: {apiStatus === 'checking' ? 'Checking...' :
                apiStatus === 'connected' ? '✅ Connected' :
                '❌ Failed to connect'}
      </p>
      {errorMessage && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '10px' }}>
          <strong>Error Details:</strong><br />
          {errorMessage}
        </div>
      )}
      {apiStatus === 'failed' && (
        <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
          <strong>Troubleshooting:</strong><br />
          1. Check if the backend is running<br />
          2. Verify CORS settings<br />
          3. Check network connectivity<br />
          4. Open browser dev tools for more details
        </div>
      )}
    </div>
  );
};

export default HealthCheck;

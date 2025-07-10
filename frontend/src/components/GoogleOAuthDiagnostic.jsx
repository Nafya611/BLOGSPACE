import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const GoogleOAuthDiagnostic = () => {
  const [backendUrl, setBackendUrl] = useState('');
  const [frontendUrl, setFrontendUrl] = useState('');
  const [diagnosticResults, setDiagnosticResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get the current environment configuration
    setBackendUrl(import.meta.env.VITE_API_URL || 'Not configured');
    setFrontendUrl(import.meta.env.VITE_FRONTEND_URL || window.location.origin);
  }, []);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);
    const results = {};

    try {
      // Test 1: Check Google OAuth config endpoint
      try {
        const configResponse = await apiClient.get('/api/user/google-config/');
        results.configEndpoint = {
          success: true,
          data: configResponse.data
        };
      } catch (err) {
        results.configEndpoint = {
          success: false,
          error: err.message,
          details: err.response?.data || 'No response data'
        };
      }

      // Test 2: Check Google login endpoint
      try {
        const loginResponse = await apiClient.get('/api/user/google-login/');
        results.loginEndpoint = {
          success: true,
          data: loginResponse.data
        };
      } catch (err) {
        results.loginEndpoint = {
          success: false,
          error: err.message,
          details: err.response?.data || 'No response data'
        };
      }

      // Test 3: Check Google test endpoint
      try {
        const testResponse = await apiClient.get('/api/user/google-test/');
        results.testEndpoint = {
          success: true,
          data: testResponse.data
        };
      } catch (err) {
        results.testEndpoint = {
          success: false,
          error: err.message,
          details: err.response?.data || 'No response data'
        };
      }

      // Set the diagnostic results
      setDiagnosticResults(results);
    } catch (err) {
      setError(`General error running diagnostics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Google OAuth Diagnostic</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>Environment</h3>
        <p><strong>Backend URL:</strong> {backendUrl}</p>
        <p><strong>Frontend URL:</strong> {frontendUrl}</p>
      </div>

      <button
        onClick={runDiagnostic}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? 'Running Diagnostics...' : 'Run Diagnostic Tests'}
      </button>

      {error && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px' }}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {Object.keys(diagnosticResults).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Diagnostic Results</h3>

          {Object.entries(diagnosticResults).map(([test, result]) => (
            <div
              key={test}
              style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                color: result.success ? '#155724' : '#721c24',
                borderRadius: '5px'
              }}
            >
              <h4>{test}</h4>
              {result.success ? (
                <>
                  <p>✅ Success</p>
                  <pre style={{
                    backgroundColor: '#f8f9fa',
                    padding: '10px',
                    borderRadius: '5px',
                    overflow: 'auto'
                  }}>
                    {formatJson(result.data)}
                  </pre>
                </>
              ) : (
                <>
                  <p>❌ Failed: {result.error}</p>
                  {result.details && (
                    <pre style={{
                      backgroundColor: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '5px',
                      overflow: 'auto'
                    }}>
                      {formatJson(result.details)}
                    </pre>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>Google OAuth Troubleshooting</h3>
        <ul style={{ textAlign: 'left' }}>
          <li>Make sure your Google OAuth Client ID and Secret are set in the backend environment variables</li>
          <li>Verify that the Redirect URI in Google Cloud Console matches the one used in your backend</li>
          <li>Check that the JavaScript Origins in Google Cloud Console includes your frontend URL</li>
          <li>Ensure CORS is properly configured on the backend to allow requests from the frontend</li>
          <li>Try the test endpoint first, as it provides more detailed error information</li>
        </ul>
      </div>
    </div>
  );
};

export default GoogleOAuthDiagnostic;

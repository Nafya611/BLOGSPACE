import React, { useState } from 'react';
import { authApi } from '../services/authApi';

const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(formData);
      console.log('Login successful:', response);

      // Call success callback if provided
      if (onLoginSuccess) {
        // Pass the user data to the success callback - this might just be a token
        // The backend might return user data directly or we may need to add it manually
        const userData = {
          username: formData.email.split('@')[0], // Use email username as fallback
          email: formData.email,
          ...response // Spread any additional data from the response
        };
        onLoginSuccess(userData);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.non_field_errors?.[0] ||
                          err.response?.data?.detail ||
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToSignup}
            >
              Sign up here
            </button>
          </p>        </div>
      </div>
    </div>
  );
};

export default Login;

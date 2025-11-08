// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logIn } from '../../services/authService';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { currentUser, authError, setAuthError } = useAuth();

  // Navigate only when logged in and active
  useEffect(() => {
    if (currentUser) navigate('/');
  }, [currentUser, navigate]);

  // Display any global auth error (from AuthContext)
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      // don't clear immediately — let user see the message
    }
  }, [authError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError(''); // clear local error on typing
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');
    setAuthError(null);

    try {
      await logIn(formData.email, formData.password);
    } catch (err) {
      let friendlyError = 'An error occurred. Please try again.';
      if (err.code === 'auth/invalid-credential') {
        friendlyError = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/user-disabled') {
        friendlyError = 'Your account has been disabled. Please contact your warden.';
      }
      setLocalError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  // Prevent setState during redirect render
  if (currentUser) return null;

  return (
    <div className="auth-container">
      <h2>Hostel Management Login</h2>

      {/* Error Message Display */}
      {(localError || authError) && (
        <p className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {localError || authError}
        </p>
      )}

      <form onSubmit={handleLogin} className="auth-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;

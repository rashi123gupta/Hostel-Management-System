// src/app/login/page.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logIn } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await logIn(formData.email, formData.password);
      // On successful login, the AuthContext's onAuthStateChanged listener
      // will update the state, and the router will handle the redirect.
      navigate('/dashboard'); // Redirect to a generic dashboard route
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // If user is already logged in, redirect them
  if (currentUser) {
    navigate('/dashboard');
    return null; // Render nothing while redirecting
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="form-input"
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <p className="message error">{error}</p>}
    </div>
  );
}

export default LoginPage;

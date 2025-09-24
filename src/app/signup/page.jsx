// src/app/signup/page.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    rollNo: '', 
    hostelNo: '', 
    roomNo: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Prepare user data for Firestore profile
    const profileData = {
      name: formData.name,
      email: formData.email,
      rollNo: formData.rollNo,
      hostelNo: formData.hostelNo,
      roomNo: formData.roomNo,
    };

    try {
      await signUp(formData.email, formData.password, profileData);
      // **THE FIX IS HERE**
      // Navigate to the root. The App component will handle the role-based redirect.
      navigate('/');
    } catch (err) {
      setError('Failed to create an account. The email may already be in use.');
      console.error(err);
    }
    setLoading(false);
  };
  
  // If user is already logged in, redirect them from the signup page
  if (currentUser) {
    navigate('/');
    return null; // Render nothing while redirecting
  }

  return (
    <div className="auth-container">
      <h2>Create Student Account</h2>
      <form onSubmit={handleSignup} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input id="name" name="name" type="text" className="form-input" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input id="email" name="email" type="email" className="form-input" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password (min. 6 characters)</label>
          <input id="password" name="password" type="password" className="form-input" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="rollNo">Roll Number</label>
          <input id="rollNo" name="rollNo" type="text" className="form-input" value={formData.rollNo} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="hostelNo">Hostel Number</label>
          <input id="hostelNo" name="hostelNo" type="text" className="form-input" value={formData.hostelNo} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="roomNo">Room Number</label>
          <input id="roomNo" name="roomNo" type="text" className="form-input" value={formData.roomNo} onChange={handleChange} required />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}


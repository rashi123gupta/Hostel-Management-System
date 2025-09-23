// src/app/signup/page.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../../services/authService';

function SignupPage() {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { email, password, ...profileData } = formData;

    try {
      await signUp(email, password, profileData);
      navigate('/dashboard'); // Redirect to dashboard after successful signup
    } catch (err) {
      setError('Failed to create an account. The email might already be in use.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup} className="auth-form">
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required className="form-input" />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="form-input" />
        <input type="password" name="password" placeholder="Password (min. 6 characters)" onChange={handleChange} required className="form-input" />
        <input type="text" name="rollNo" placeholder="Roll Number" onChange={handleChange} className="form-input" />
        <input type="text" name="hostelNo" placeholder="Hostel Number" onChange={handleChange} className="form-input" />
        <input type="text" name="roomNo" placeholder="Room Number" onChange={handleChange} className="form-input" />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      {error && <p className="message error">{error}</p>}
    </div>
  );
}

export default SignupPage;

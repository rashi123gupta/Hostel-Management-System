import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../../services/authService';

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNo: '',
    hostelNo: '',
    roomNo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.rollNo) {
      setError('Please fill out all required fields.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Separate email/password from the rest of the profile data
      const { email, password, ...profileData } = formData;
      const result = await signUp(email, password, profileData);

      if (result.success) {
        navigate('/'); // Redirect to the main dashboard redirector
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Student Account</h2>
      <form onSubmit={handleSignup} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label htmlFor="rollNo">Roll Number</label>
          <input type="text" name="rollNo" id="rollNo" value={formData.rollNo} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label htmlFor="hostelNo">Hostel Number</label>
          <input type="text" name="hostelNo" id="hostelNo" value={formData.hostelNo} onChange={handleChange} className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="roomNo">Room Number</label>
          <input type="text" name="roomNo" id="roomNo" value={formData.roomNo} onChange={handleChange} className="form-input" />
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
}

export default SignupPage;


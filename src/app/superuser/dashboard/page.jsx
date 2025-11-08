import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../../../services/firebase';
import { useAuth } from '../../../context/AuthContext';
import { getAllUsers } from '../../../services/userService';
import { createNewUser } from '../../../services/userService';
import '../../../styles/global.css';

function SuperuserDashboard() {
  const { userProfile } = useAuth();
  const [summary, setSummary] = useState({ totalWardens: 0, totalStudents: 0 });
  const [loading, setLoading] = useState(true);

  // State for the "Create Warden" form
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSummaryData = useCallback(async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      const wardens = allUsers.filter(u => u.role === 'warden').length;
      const students = allUsers.filter(u => u.role === 'student').length;
      setSummary({ totalWardens: wardens, totalStudents: students });
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("You must be logged in with a Superuser account to create a Warden.");
      return;
    }
    console.log(auth.currentUser);

    setFormLoading(true);
    setMessage('');
    setError('');

    try {
      const userData = {
        ...formData,
        roleToCreate: 'warden',
      };
      const result = await createNewUser(userData);
      setMessage(result.message);
      setFormData({ name: '', email: '', password: '' }); 
      fetchSummaryData(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Profile Card */}
      <div className="user-profile-container card">
        <div className="profile-image">
          <img 
            src="https://logowik.com/content/uploads/images/t_blue-member-icon9937.logowik.com.webp"
            alt="Superuser Profile" 
          />
        </div>
        <div className="user-details-card">
          <h2 className="user-name">{userProfile?.name || 'Superuser'}</h2>
          <p className="user-info">Role: {userProfile?.role}</p>
          <p className="user-info">Email: {userProfile?.email}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-card card">
        <h3>System Overview</h3>
        {loading ? <div className="loading">Loading stats...</div> : (
          <div className="summary-grid">
            <div className="summary-item card">
              <p>Total Wardens</p>
              <h4>{summary.totalWardens}</h4>
            </div>
            <div className="summary-item card">
              <p>Total Students</p>
              <h4>{summary.totalStudents}</h4>
            </div>
          </div>
        )}
      </div>

      {/* Create Warden Form */}
      <div className="card">
        <h3>Create New Warden</h3>
        <p>Use this form to create a new warden account.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text" id="name" name="name"
              value={formData.name} onChange={handleChange}
              required className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email" id="email" name="email"
              value={formData.email} onChange={handleChange}
              required className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password" id="password" name="password"
              value={formData.password} onChange={handleChange}
              required minLength="6" className="form-input"
              placeholder="Min 6 characters"
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create Warden'}
            </button>
          </div>
          {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default SuperuserDashboard;
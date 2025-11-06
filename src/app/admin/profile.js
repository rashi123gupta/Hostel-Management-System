// src/app/profile/page.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/userService';

function ProfilePage() {
  const { userProfile, currentUser, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Initialize form data with the current user profile when it loads
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        rollNo: userProfile.rollNo || '',
        hostelNo: userProfile.hostelNo || '',
        roomNo: userProfile.roomNo || '',
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setError('');
    setMessage('');

    // Prepare data: only include fields that apply to the current user's role
    const dataToSave = { 
      name: formData.name, 
    };
    
    // Only save hostel-related fields if the user is a student
    if (userProfile?.role === 'student') {
      dataToSave.rollNo = formData.rollNo;
      dataToSave.hostelNo = formData.hostelNo;
      dataToSave.roomNo = formData.roomNo;
    }

    try {
      await updateUserProfile(currentUser.uid, dataToSave);
      setMessage('Profile updated successfully! Refreshing data...');
      // The AuthContext listener will automatically fetch the new profile data, 
      // so we just need to wait a moment and then exit edit mode.
      setTimeout(() => {
        setIsEditing(false);
        setMessage('');
      }, 1500);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="loading">Loading Profile...</div>;
  if (!userProfile) return <div className="error-message">Error: Could not load user profile.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEditing ? 'Edit Profile' : 'My Profile'}</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="btn-primary"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <div className="card">
        {error && <p className="error-message" style={{marginBottom: '1rem'}}>{error}</p>}
        {message && <p className="success-message" style={{marginBottom: '1rem', color: '#2ecc71', fontWeight: 'bold'}}>{message}</p>}

        <form onSubmit={handleSaveProfile}>
          {/* Common Details */}
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="form-input"
              disabled={!isEditing || loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={userProfile.email || ''}
              className="form-input"
              disabled 
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              value={userProfile.role || ''}
              className="form-input"
              disabled
            />
          </div>

          {userProfile.role === 'student' && (
            <>
              <h2 style={{marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem'}}>Hostel Details</h2>
              
              <div className="form-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo || ''}
                  onChange={handleChange}
                  className="form-input"
                  disabled={!isEditing || loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>Hostel No</label>
                <input
                  type="text"
                  name="hostelNo"
                  value={formData.hostelNo || ''}
                  onChange={handleChange}
                  className="form-input"
                  disabled={!isEditing || loading}
                />
              </div>

              <div className="form-group">
                <label>Room No</label>
                <input
                  type="text"
                  name="roomNo"
                  value={formData.roomNo || ''}
                  onChange={handleChange}
                  className="form-input"
                  disabled={!isEditing || loading}
                />
              </div>
            </>
          )}
          
          {isEditing && (
            <div className="profile-actions">
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading} 
                style={{marginTop: '2rem'}}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
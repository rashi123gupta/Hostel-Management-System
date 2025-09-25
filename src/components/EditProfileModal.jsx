import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/userService';

function EditProfileModal({ onClose }) {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    hostelNo: '',
    roomNo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill the form with the current user's data when the modal opens
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        hostelNo: userProfile.hostelNo || '',
        roomNo: userProfile.roomNo || '',
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateUserProfile(userProfile.id, formData);
      alert('Profile updated successfully!');
      onClose(); // Close the modal on success
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit Your Profile</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="hostelNo">Hostel No.</label>
            <input
              id="hostelNo"
              name="hostelNo"
              type="text"
              className="form-input"
              value={formData.hostelNo}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="roomNo">Room No.</label>
            <input
              id="roomNo"
              name="roomNo"
              type="text"
              className="form-input"
              value={formData.roomNo}
              onChange={handleChange}
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="btn-close-modal">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;

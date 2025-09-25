import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/userService';

function EditProfileModal({ onClose }) {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When the modal opens, populate the form with the current user's data
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!userProfile) return;

    setLoading(true);
    setError('');

    // Prepare only the data that needs to be updated based on the user's role
    const dataToUpdate = {
      name: formData.name,
    };

    if (userProfile.role === 'student') {
      dataToUpdate.hostelNo = formData.hostelNo;
      dataToUpdate.roomNo = formData.roomNo;
    }

    try {
      await updateUserProfile(userProfile.id, dataToUpdate);
      alert('Profile updated successfully!');
      onClose();
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit Your Profile</h3>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleUpdate}>
          <div className="modal-form-body">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            
            {/* These fields will only appear if the user is a student */}
            {userProfile?.role === 'student' && (
              <>
                <div className="form-group">
                  <label htmlFor="hostelNo">Hostel Number</label>
                  <input
                    type="text"
                    id="hostelNo"
                    name="hostelNo"
                    value={formData.hostelNo || ''}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="roomNo">Room Number</label>
                  <input
                    type="text"
                    id="roomNo"
                    name="roomNo"
                    value={formData.roomNo || ''}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </>
            )}
          </div>
          
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


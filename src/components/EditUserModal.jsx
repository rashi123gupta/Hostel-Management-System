import React, { useState, useEffect } from 'react';
import { updateUserProfile } from '../services/userService';
import '../styles/global.css'; // Ensure styles are imported

/**
 * A "smart" modal component for editing existing users.
 * It shows different fields based on the user's role.
 * @param {object} props
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onUserUpdated - Function to refresh the user list.
 * @param {object} props.userToEdit - The user object to be edited.
 */
function AdminEditUserModal({ onClose, onUserUpdated, userToEdit }) {
  const [formData, setFormData] = useState({ name: '', rollNo: '', hostelNo: '', roomNo: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When the modal opens, populate the form with the user's current data
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name || '',
        rollNo: userToEdit.rollNo || '',
        hostelNo: userToEdit.hostelNo || '',
        roomNo: userToEdit.roomNo || '',
      });
    }
  }, [userToEdit]);

  // Handle changes for all form inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare only the data that needs to be updated.
      // We only edit profile data, not auth data like email or role.
      const dataToUpdate = {
        name: formData.name,
      };

      // If the user is a student, add the student-specific fields
      if (userToEdit.role === 'student') {
        dataToUpdate.rollNo = formData.rollNo;
        dataToUpdate.hostelNo = formData.hostelNo;
        dataToUpdate.roomNo = formData.roomNo;
      }

      await updateUserProfile(userToEdit.id, dataToUpdate);
      alert('User profile updated successfully!');
      
      onUserUpdated(); // Refresh the user list in the parent component
      onClose(); // Close the modal
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userToEdit) return null; // Don't render if no user is provided

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit User: {userToEdit.name}</h3>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="modal-form-body">
            {/* Common field for all roles */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="form-input" />
            </div>

            {/* --- "SMART" FIELDS: Only show if editing a student --- */}
            {userToEdit.role === 'student' && (
              <>
                <div className="form-group">
                  <label htmlFor="rollNo">Roll No</label>
                  <input type="text" id="rollNo" name="rollNo" value={formData.rollNo} onChange={handleChange} required className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="hostelNo">Hostel No</label>
                  <input type="text" id="hostelNo" name="hostelNo" value={formData.hostelNo} onChange={handleChange} required className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="roomNo">Room No</label>
                  <input type="text" id="roomNo" name="roomNo" value={formData.roomNo} onChange={handleChange} required className="form-input" />
                </div>
              </>
            )}
            {/* --- End of conditional fields --- */}
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

export default AdminEditUserModal;
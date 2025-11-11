import React, { useState } from 'react';
import { createNewUser } from '../services/userService'; 
import '../styles/global.css';

function AddUserModal({ onClose, onUserAdded, roleToCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNo: '',
    hostelNo: '',
    roomNo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Prepare data payload
    const userData = {
      ...formData,
      roleToCreate: roleToCreate,
    };

    try {
      await createNewUser(userData);
      alert(`New ${roleToCreate} created successfully! They will receive an email to set their password.`);
      onUserAdded(); // This will refresh the user list
      onClose(); // This will close the modal
    } catch (err) {
      console.error(err);
      // Display a more specific error from the Cloud Function if available
      if (err.message.includes('auth/email-already-exists')) {
        setError('This email address is already in use.');
      } else {
        setError(err.message || `Failed to create new ${roleToCreate}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine the title based on the role being created
  const title = roleToCreate === 'warden' ? 'Create New Warden' : 'Create New Student';
  const isStudent = roleToCreate === 'student';

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>{title}</h3>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="modal-form-body">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
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
            
            {/* Conditionally show student-only fields */}
            {isStudent && (
              <>
                <div className="form-group">
                  <label htmlFor="rollNo">Roll No</label>
                  <input
                    type="text"
                    id="rollNo"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hostelNo">Hostel No</label>
                  <input
                    type="text"
                    id="hostelNo"
                    name="hostelNo"
                    value={formData.hostelNo}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="roomNo">Room No</label>
                  <input
                    type="text"
                    id="roomNo"
                    name="roomNo"
                    value={formData.roomNo}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="modal-actions">
            <button typeT="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating User...' : `Create ${roleToCreate}`}
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

export default AddUserModal;
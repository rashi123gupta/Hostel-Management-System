import React, { useState } from 'react';
import { createNewUser } from '../services/userService';
import '../styles/global.css'; // Ensure styles are imported

/**
 * A "smart" modal component for creating new users.
 * It shows different fields based on the role being created.
 * @param {object} props
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onUserAdded - Function to refresh the user list.
 * @param {string} props.roleToCreate - The role of the user to create ('warden' or 'student').
 */
function AddUserModal({ onClose, onUserAdded, roleToCreate }) {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', rollNo: '', hostelNo: '', roomNo: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine the title based on the role
  const title = roleToCreate === 'warden' ? 'Add New Warden' : 'Add New Student';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Pass all form data + the roleToCreate prop to the service
      const userData = {
        ...formData,
        roleToCreate: roleToCreate,
      };
      
      const result = await createNewUser(userData);
      alert(`Successfully created ${roleToCreate}: ${formData.name}`);
      
      onUserAdded(); // Refresh the user list in the parent component
      onClose(); // Close the modal
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>{title}</h3>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="modal-form-body">
            {/* Common fields for all roles */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" className="form-input" placeholder="Min 6 characters" />
            </div>

            {/* --- SMART" FIELDS: Only show if creating a student --- */}
            {roleToCreate === 'student' && (
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
              {loading ? 'Creating...' : `Create ${roleToCreate}`}
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
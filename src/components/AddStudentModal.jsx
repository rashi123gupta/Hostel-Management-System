import React, { useState } from 'react';
import { createNewUser } from '../services/userService';
import '../styles/global.css';

function AddStudentModal({ onClose, onStudentAdded }) {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', rollNo: '', hostelNo: '', roomNo: '' 
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

    try {
      const userData = {
        ...formData,
        roleToCreate: 'student',
      };
      const result = await createNewUser(userData);
      alert(result.message); // Show success message
      onStudentAdded(); // Refresh the user list in the parent component
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
        <h3>Add New Student</h3>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="modal-form-body">
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
          </div>
          
          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Student'}
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

export default AddStudentModal;
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addComplaint } from '../services/complaintService';

function AddComplaintModal({ onClose }) {
  const { currentUser } = useAuth();
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("You must be logged in to add a complaint.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      await addComplaint(currentUser.uid, { description });
      alert('Complaint submitted successfully!');
      onClose();
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add New Complaint</h3>
        {error && <p className="error-message">{error}</p>}
        
        {/* The form structure is slightly changed for better styling */}
        <form onSubmit={handleSubmit}>
          <div className="modal-form-body">
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="form-input"
                placeholder="Please describe the issue in detail"
              ></textarea>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
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

export default AddComplaintModal;


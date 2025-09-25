// src/components/AddComplaintForm.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { addComplaint } from '../services/complaintService';

export default function AddComplaintForm({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [description, setDescription] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Complaint description cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addComplaint(currentUser.uid, { description });
      onSuccess(); // Notify parent to re-fetch data
      onClose();   // Close the modal
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>File a New Complaint</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="description">Complaint Details</label>
              <textarea
                id="description"
                name="description"
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                placeholder="Please describe the issue in detail..."
                required
              ></textarea>
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-close-modal">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// src/components/RequestLeaveForm.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
// FIX: Changed function name from addLeaveRequest to addLeave
import { addLeave } from '../services/leaveService';

export default function RequestLeaveForm({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = React.useState({
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fromDate || !formData.toDate || !formData.reason) {
      setError('All fields are required.');
      return;
    }
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
        setError('"From Date" cannot be after "To Date".');
        return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // FIX: Changed function call to addLeave
      await addLeave(currentUser.uid, {
        fromDate: new Date(formData.fromDate),
        toDate: new Date(formData.toDate),
        reason: formData.reason,
      });
      onSuccess(); // Notify parent to re-fetch data
      onClose();   // Close the modal
    } catch (err) {
      setError('Failed to submit leave request. Please try again.');
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
          <h2>Request New Leave</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="fromDate">From Date</label>
              <input
                type="date"
                id="fromDate"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="toDate">To Date</label>
              <input
                type="date"
                id="toDate"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reason">Reason</label>
              <textarea
                id="reason"
                name="reason"
                rows="4"
                value={formData.reason}
                onChange={handleChange}
                className="form-input"
                placeholder="Please provide a brief reason for your leave"
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
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


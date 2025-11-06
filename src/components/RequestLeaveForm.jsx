import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addLeave } from '../services/leaveService';

function RequestLeaveModal({ onClose }) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({ fromDate: '', toDate: '', reason: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("You must be logged in to request leave.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      await addLeave(currentUser.uid, formData);
      alert('Leave request submitted successfully!');
      onClose();
    } catch (err) {
      setError('Failed to submit leave request. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Request New Leave</h3>
        {error && <p className="error-message">{error}</p>}

        {/* The form structure is slightly changed for better styling */}
        <form onSubmit={handleSubmit}>
          <div className="modal-form-body">
            <div className="form-group">
              <label htmlFor="fromDate">From Date</label>
              <input
                type="date"
                id="fromDate"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                required
                className="form-input"
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
                required
                className="form-input"
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
                required
                className="form-input"
                placeholder="Please provide a brief reason for your leave"
              ></textarea>
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
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

export default RequestLeaveModal;

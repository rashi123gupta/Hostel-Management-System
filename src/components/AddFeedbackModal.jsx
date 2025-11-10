import React, { useState } from 'react';
import { addMessFeedback } from '../services/messFeedbackService';
import { useAuth } from '../context/AuthContext';

function AddFeedbackModal({ onClose, onFeedbackAdded }) {
  const { userProfile } = useAuth();
  const [rating, setRating] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a rating.");
      return;
    }
    if (!userProfile) {
      setError("Could not find user profile. Please try again.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const feedbackData = {
        rating: Number(rating),
        suggestions: suggestions || '-', 
        studentName: userProfile.name,
        rollNo: userProfile.rollNo,
      };
      
      await addMessFeedback(feedbackData);

      alert('Feedback submitted successfully!');
      onFeedbackAdded(); // This will just close the modal
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Submit Mess Feedback</h3>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="modal-form-body">
            
            <div className="form-group">
              <label htmlFor="rating">Your Rating</label>
              <select
                id="rating"
                name="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="form-input" // Use existing style
                required
              >
                <option value="" disabled>Select a rating</option>
                <option value="1">1 - Very Poor</option>
                <option value="2">2 - Poor</option>
                <option value="3">3 - Average</option>
                <option value="4">4 - Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="suggestions">Suggestions</label>
              <textarea
                id="suggestions"
                name="suggestions"
                rows="4"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                className="form-input"
                placeholder="What did you like or dislike? (Optional)"
              ></textarea>
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
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

export default AddFeedbackModal;
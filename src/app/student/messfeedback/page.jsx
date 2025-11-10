import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { onStudentFeedbackChange } from '../../../services/messFeedbackService'; 
import AddFeedbackModal from '../../../components/AddFeedbackModal';
import '../../../styles/global.css'; 

export default function MessFeedbackPage() {
  const { currentUser } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onStudentFeedbackChange(
      currentUser.uid,
      (updatedFeedback) => {
        setFeedbackList(updatedFeedback);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Failed to load feedback history.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return 'Pending...';
      if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-GB');
      }
      return new Date(timestamp).toLocaleDateString('en-GB');
    } catch {
      return 'N/A';
    }
  };

  const renderRating = (rating) => {
    if (!rating || rating < 1) return 'N/A';
    return '⭐'.repeat(rating);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Mess Feedback</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          Add New Feedback
        </button>
      </div>

      {loading && <div className="loading">Loading your feedback...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className="card">
          {feedbackList.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Rating</th>
                  <th>Suggestions</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((feedback) => (
                  <tr key={feedback.id}>
                    <td>{formatDate(feedback.createdAt)}</td>
                    <td>{renderRating(feedback.rating)}</td>
                    <td>{feedback.suggestions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>You have not submitted any mess feedback yet.</p>
          )}
        </div>
      )}

      {isModalOpen && (
        <AddFeedbackModal
          onClose={() => setIsModalOpen(false)}
          onFeedbackAdded={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}

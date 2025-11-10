import React, { useState, useEffect, useCallback } from 'react';
import { onAllFeedbackChange } from '../../../services/messFeedbackService'; 
import '../../../styles/global.css';

// This component is for the Warden to view all feedback
function WardenMessFeedbackPage() {
  const [allFeedback, setAllFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filter, setFilter] = useState('all'); 

  // Sets up the real-time listener 
  useEffect(() => {
    setLoading(true);
    // Call the listener. It returns an 'unsubscribe' function.
    const unsubscribe = onAllFeedbackChange(
      (updatedFeedback) => {
        // This callback runs every time the data changes
        setAllFeedback(updatedFeedback); // Store the master list
        setLoading(false);
      },
      (err) => {
        // This is the error callback (e.g., for missing index)
        console.error(err);
        if (err.code === 'failed-precondition') {
          setError('This query requires a new index. Please check the console for a link to create it.');
        } else {
          setError('Failed to fetch feedback.');
        }
        setLoading(false);
      }
    );
    
    // The cleanup function for useEffect:
    // This runs when the component unmounts to prevent memory leaks
    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  
  // This effect runs every time the filter or the master list changes
  useEffect(() => {
    let filtered = [];
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filter === 'all') {
      filtered = allFeedback;
    } else {
      let filterDate = new Date(today);
      if (filter === '7days') {
        filterDate.setDate(today.getDate() - 7);
      } else if (filter === '30days') {
        filterDate.setDate(today.getDate() - 30);
      }
      
      filtered = allFeedback.filter(fb => {
        if (!fb.createdAt || !fb.createdAt.toDate) return false;
        const fbDate = fb.createdAt.toDate();
        
        if (filter === 'today') {
          return fbDate.getFullYear() === today.getFullYear() &&
                 fbDate.getMonth() === today.getMonth() &&
                 fbDate.getDate() === today.getDate();
        } else {
          return fbDate >= filterDate;
        }
      });
    }
    
    setFilteredFeedback(filtered);
  }, [allFeedback, filter]); 

  const formatDate = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('en-GB');
    }
    return 'N/A';
  };

  const renderRating = (rating) => {
    if (!rating || rating < 1) return 'N/A';
    return '⭐'.repeat(rating);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Mess Feedback</h1>
        
        <div className="status-filter-container">
          <label htmlFor="date-filter">Show:</label>
          <select 
            id="date-filter"
            className="status-filter-select" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">This Month (Last 30 Days)</option>
          </select>
        </div>
      </div>

      {loading && <div className="loading">Loading feedback...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <div className="card">
          {filteredFeedback.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Rating</th>
                  <th>Suggestions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedback.map((feedback) => (
                  <tr key={feedback.id}>
                    <td>{formatDate(feedback.createdAt)}</td>
                    <td>{feedback.studentName || 'N/A'}</td>
                    <td>{feedback.rollNo || 'N/A'}</td>
                    <td>{renderRating(feedback.rating)}</td>
                    <td>{feedback.suggestions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <p>No feedback found for the selected time period.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default WardenMessFeedbackPage;
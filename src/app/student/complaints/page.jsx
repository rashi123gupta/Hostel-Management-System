import React, { useState, useEffect } from 'react';
import AddComplaintForm from '../../../components/AddComplaintForm';
import { onStudentComplaintsChange } from '../../../services/complaintService';
import { useAuth } from '../../../context/AuthContext';

export default function StudentComplaintsPage() {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // useEffect now sets up the real-time listener 
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    setLoading(true);

    // Call the listener function. It returns an 'unsubscribe' function.
    const unsubscribe = onStudentComplaintsChange(
      currentUser.uid, 
      (updatedComplaints) => {
        // This callback runs every time the data changes
        setComplaints(updatedComplaints);
        setLoading(false);
      }
    );

    // The cleanup function for useEffect
    return () => {
      unsubscribe();
    };

  }, [currentUser]); // Re-run this effect if the user changes

  // This function now only needs to close the modal 
  const handleComplaintAdded = () => {
    setIsModalOpen(false);
  };
  
  const formatDateForDisplay = (dateValue) => {
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString('en-GB'); // DD/MM/YYYY
    }
    return 'N/A';
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-pending';
    const lowerStatus = status.toLowerCase(); 
    switch (lowerStatus) {
      case 'resolved':
        return 'status-approved'; 
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Complaints</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          Add Complaint
        </button>
      </div>

      {loading && <div className="loading">Loading your complaint history...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <div className="card">
          {complaints.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Resolution Details</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>{formatDateForDisplay(complaint.createdAt)}</td>
                    <td>{complaint.description}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td>{complaint.resolutionDetails}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>You have not filed any complaints yet.</p>
          )}
        </div>
      )}

      {isModalOpen && (
        <AddComplaintForm
          onClose={() => setIsModalOpen(false)}
          onComplaintAdded={handleComplaintAdded}
        />
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react'; 
import { useAuth } from '../../../context/AuthContext';
import { onStudentComplaintsChange } from '../../../services/complaintService';
import AddComplaintForm from '../../../components/AddComplaintForm';
import '../../../styles/global.css';

export default function StudentComplaintsPage() {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null); // Clear any previous errors

    // Call the listener function. It returns an 'unsubscribe' function.
    const unsubscribe = onStudentComplaintsChange(
      currentUser.uid,
      (updatedComplaints) => {
        // This is the success callback
        setComplaints(updatedComplaints);
        setLoading(false);
      },
      (err) => {
        // This is the error callback
        console.error(err);
        setError('Failed to load complaints.');
        setLoading(false);
      }
    );

    // The cleanup function for useEffect
    return () => {
      unsubscribe();
    };

  }, [currentUser]); // Re-run if the user changes

  const handleComplaintAdded = () => {
    // The listener will automatically update the list.
    // We just need to close the modal.
    setIsModalOpen(false);
  };
  
  const formatDateForDisplay = (dateValue) => {
    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
    }
    if (typeof dateValue === 'string') {
      return dateValue;
    }
    return 'N/A';
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-pending';
    const lowerStatus = status.toLowerCase(); 
    switch (lowerStatus) {
      case 'resolved':
        return 'status-approved'; // Use 'status-approved' for green
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Your Complaints</h1>
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
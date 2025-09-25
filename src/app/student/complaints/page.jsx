import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getStudentComplaints } from '../../../services/complaintService';
import AddComplaintForm from '../../../components/AddComplaintForm';

export default function StudentComplaintsPage() {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchComplaints = React.useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const studentComplaints = await getStudentComplaints(currentUser.uid);
      setComplaints(studentComplaints);
    } catch (err) {
      setError('Failed to fetch complaints.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  React.useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleComplaintAdded = () => {
    fetchComplaints(); // Re-fetch complaints to show the new one
    setIsModalOpen(false);
  };
  
  const formatDateForDisplay = (dateValue) => {
    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString();
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
        return 'status-approved';
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

      {loading && <p>Loading your complaint history...</p>}
      {error && <p className="error-message">{error}</p>}
      
      {!loading && !error && (
        <div className="table-container">
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
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleComplaintAdded}
        />
      )}
    </div>
  );
}

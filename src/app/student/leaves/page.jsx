// src/app/student/leaves/page.jsx
import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getStudentLeaves } from '../../../services/leaveService';
import RequestLeaveForm from '../../../components/RequestLeaveForm';

export default function StudentLeavesPage() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchLeaves = React.useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const studentLeaves = await getStudentLeaves(currentUser.uid);
      setLeaves(studentLeaves);
    } catch (err) {
      setError('Failed to fetch leave requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  React.useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Function to be called when a new leave is successfully added
  const handleLeaveAdded = () => {
    fetchLeaves(); // Re-fetch the leaves to show the new one
  };
  
  // This function now only needs to format the 'appliedAt' timestamp
  const formatDate = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return 'N/A';
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-pending';
    // Make status check case-insensitive to handle 'pending' or 'Pending'
    const lowerStatus = status.toLowerCase(); 
    switch (lowerStatus) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
      default:
        return 'status-pending';
    }
  };


  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Your Leave Requests</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          Request Leave
        </button>
      </div>

      {loading && <p>Loading your leave history...</p>}
      {error && <p className="error-message">{error}</p>}
      
      {!loading && !error && (
        <div className="table-container">
          {leaves.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Reason</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Admin Remarks</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.fromDate}</td>
                    <td>{leave.toDate}</td>
                    <td>{leave.reason}</td>
                    <td>{formatDate(leave.appliedAt)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>{leave.adminRemarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <p>You have not applied for any leaves yet.</p>
          )}
        </div>
      )}

      {isModalOpen && (
        <RequestLeaveForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleLeaveAdded}
        />
      )}
    </div>
  );
}


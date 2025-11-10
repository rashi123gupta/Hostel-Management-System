import React, { useState, useEffect } from 'react'; 
import { useAuth } from '../../../context/AuthContext';
import { onStudentLeavesChange } from '../../../services/leaveService'; 
import RequestLeaveForm from '../../../components/RequestLeaveForm'; 
import '../../../styles/global.css'; 

export default function StudentLeavesPage() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null); 

    const unsubscribe = onStudentLeavesChange(
      currentUser.uid, 
      (updatedLeaves) => {
        setLeaves(updatedLeaves);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Failed to load leave requests.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };

  }, [currentUser]); 

  const handleLeaveAdded = () => {
    setIsModalOpen(false);
  };
  
  const formatDate = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-GB');
    }
    return 'N/A';
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-pending';
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
        <h1 className="page-title">My Leaves</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          Request Leave
        </button>
      </div>

      {loading && <div className="loading">Loading your leave history...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <div className="card">
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
          onClose={() => setIsModalOpen(false)}
          onLeaveAdded={handleLeaveAdded}
        />
      )}
    </div>
  );
}
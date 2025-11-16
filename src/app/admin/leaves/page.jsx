import React, { useState, useEffect, useCallback } from 'react';
// --- MODIFICATION: Import the new listener ---
import { onAllLeavesChange, updateLeaveStatus } from '../../../services/leaveService';
import { getAllUsers } from '../../../services/userService';

function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState({}); 
  const [leaveStatus, setLeaveStatus] = useState({});
  const [remarks, setRemarks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentLeaveId, setCurrentLeaveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- MODIFICATION: This function just fetches the user map now ---
  const fetchUsers = useCallback(async () => {
    // This only needs to run once.
    try {
      const fetchedUsers = await getAllUsers();
      const userMap = fetchedUsers.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {});
      setUsers(userMap);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError('Failed to fetch user data. Leaves may not show names.');
    }
  }, []);

  // --- MODIFICATION: This useEffect now sets up the real-time listener ---
  useEffect(() => {
    setLoading(true);
    // Fetch the user map first
    fetchUsers();

    // Set up the real-time listener for leaves
    const unsubscribe = onAllLeavesChange(
      (sortedLeaves) => {
        // This is the success callback
        setLeaves(sortedLeaves);

        // We still need to initialize the local state for statuses/remarks
        const initialStatus = sortedLeaves.reduce((acc, leave) => {
          acc[leave.id] = leave.status;
          return acc;
        }, {});
        setLeaveStatus(initialStatus);

        const initialRemarks = sortedLeaves.reduce((acc, leave) => {
          acc[leave.id] = leave.adminRemarks || '';
          return acc;
        }, {});
        setRemarks(initialRemarks);

        setLoading(false);
      },
      (err) => {
        // This is the error callback
        console.error(err);
        setError('Failed to load leave requests.');
        setLoading(false);
      }
    );

    // Cleanup function runs when component unmounts
    return () => {
      unsubscribe();
    };
  }, [fetchUsers]); // Run this effect only once on mount

  const handleStatusChange = async (leaveId, newStatus) => {
// ... (existing code is correct) ...
    try {
      const remarksForLeave = remarks[leaveId] || '-';
      await updateLeaveStatus(leaveId, newStatus, remarksForLeave);
      setLeaveStatus(prev => ({ ...prev, [leaveId]: newStatus }));
      alert(`Leave status updated successfully!`);
    } catch (err) {
      console.error("Error updating leave status:", err);
      setError('Failed to update leave status.');
    }
  };
  
  const openModal = (leaveId) => {
// ... (existing code is correct) ...
    setCurrentLeaveId(leaveId);
    setShowModal(true);
  };

  const handleRemarksChange = (e) => {
// ... (existing code is correct) ...
    setRemarks(prev => ({ ...prev, [currentLeaveId]: e.target.value }));
  };

  const handleSaveRemarks = async () => {
// ... (existing code is correct) ...
    if (!currentLeaveId) return;
    try {
      const status = leaveStatus[currentLeaveId];
      const newRemarks = remarks[currentLeaveId];
      await updateLeaveStatus(currentLeaveId, status, newRemarks);
      setShowModal(false);
      alert('Remarks saved successfully!');
    } catch (err) {
      console.error("Error saving remarks:", err);
      setError('Failed to save remarks.');
    }
  };

  if (loading) return <div className="loading">Loading leaves...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container">
{/* ... (existing code is correct) ... */}
      <div className="page-header">
        <h1>Manage Leaves</h1>
      </div>
      <div className="card">
        {leaves.length > 0 ? (
          <table className="data-table">
            <thead>
{/* ... (existing code is correct) ... */}
              <tr>
                <th>Applied On</th>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>From Date</th>
{/* ... (existing code is correct) ... */}
                <th>To Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Admin Remarks</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => {
                const student = users[leave.studentId]; 
                const formatDate = (timestamp) => {
                  if (timestamp && typeof timestamp.toDate === 'function') {
                    return timestamp.toDate().toLocaleDateString('en-GB');
                  }
                  return 'N/A';
                };
                return (
                  <tr key={leave.id}>
                    <td>{formatDate(leave.appliedAt)}</td>
                    <td>{student?.name || 'N/A'}</td>
                    <td>{student?.rollNo || 'N/A'}</td>
                    <td>{leave.fromDate}</td>
{/* ... (existing code is correct) ... */}
                    <td>{leave.toDate}</td>
                    <td>{leave.reason}</td>
                    <td>
                      <select
                        value={leaveStatus[leave.id] || leave.status}
                        onChange={(e) => handleStatusChange(leave.id, e.target.value)}
                        className={`status-select status-${(leaveStatus[leave.id] || leave.status).toLowerCase()}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <span>
                          {(remarks[leave.id] && remarks[leave.id] !== '-') 
                            ? `${remarks[leave.id].substring(0, 15)}...` 
                            : '-'}
                        </span>
                        <button onClick={() => openModal(leave.id)} className="btn-add-remarks">Edit</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No leave requests found.</p>
        )}
      </div>

      {showModal && (
        <div className="modal">
{/* ... (existing code is correct) ... */}
          <div className="modal-content">
            <h3>Edit Remarks</h3>
            <textarea
              className="remarks-textarea"
              rows="4"
              value={remarks[currentLeaveId] || ''}
              onChange={handleRemarksChange}
              placeholder="Enter admin remarks here..."
            ></textarea>
            <div className="modal-actions">
              <button onClick={handleSaveRemarks} className="btn-primary">Save</button>
              <button onClick={() => setShowModal(false)} className="btn-close-modal">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLeaves;
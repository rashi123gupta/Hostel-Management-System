import React, { useState, useEffect, useCallback } from 'react';
import { getAllLeaves, updateLeaveStatus } from '../../../services/leaveService';
import { getAllUsers } from '../../../services/userService';

function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState({}); // This will store our map of users
  const [leaveStatus, setLeaveStatus] = useState({});
  const [remarks, setRemarks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentLeaveId, setCurrentLeaveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeavesAndUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedLeaves, fetchedUsers] = await Promise.all([
        getAllLeaves(),
        getAllUsers(),
      ]);

      // Create a map of users for easy lookup by their ID
      const userMap = fetchedUsers.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {});
      
      // *** THE FIX IS HERE ***
      // We now correctly set the userMap to the state.
      setUsers(userMap); 
      setLeaves(fetchedLeaves);
      
      // Initialize local state for statuses and remarks from fetched data
      const initialStatus = fetchedLeaves.reduce((acc, leave) => {
        acc[leave.id] = leave.status;
        return acc;
      }, {});
      setLeaveStatus(initialStatus);

      const initialRemarks = fetchedLeaves.reduce((acc, leave) => {
        acc[leave.id] = leave.adminRemarks || '';
        return acc;
      }, {});
      setRemarks(initialRemarks);

    } catch (err) {
      setError('Failed to fetch leave data.');
      console.error("Error fetching leaves:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeavesAndUsers();
  }, [fetchLeavesAndUsers]);

  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      const remarksForLeave = remarks[leaveId] || '-';
      await updateLeaveStatus(leaveId, newStatus, remarksForLeave);
      
      // Update local state to immediately reflect the change
      setLeaveStatus(prev => ({ ...prev, [leaveId]: newStatus }));
      
      alert(`Leave status updated successfully!`);
    } catch (err) {
      console.error("Error updating leave status:", err);
      setError('Failed to update leave status.');
    }
  };
  
  const openModal = (leaveId) => {
    setCurrentLeaveId(leaveId);
    setShowModal(true);
  };

  const handleRemarksChange = (e) => {
    setRemarks(prev => ({ ...prev, [currentLeaveId]: e.target.value }));
  };

  const handleSaveRemarks = async () => {
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
      <h1 className="page-title">Manage Leave Requests</h1>
      <div className="card">
        {leaves.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Admin Remarks</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => {
                const student = users[leave.studentId]; // Find the student from the map
                return (
                  <tr key={leave.id}>
                    <td>{student?.name || 'N/A'}</td>
                    <td>{student?.rollNo || 'N/A'}</td>
                    <td>{leave.fromDate}</td>
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


import React, { useState, useEffect, useCallback } from 'react';
import { getAllLeaves, updateLeaveStatus } from '../../../services/leaveService';
import { getAllUsers } from '../../../services/userService';

function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for the remarks modal
  const [showModal, setShowModal] = useState(false);
  const [currentLeaveId, setCurrentLeaveId] = useState(null);
  const [remarks, setRemarks] = useState({});

  const fetchLeaveData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedLeaves, fetchedUsers] = await Promise.all([
        getAllLeaves(),
        getAllUsers()
      ]);

      const userMap = fetchedLeaves.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {});
      
      setLeaves(fetchedLeaves);
      setUsers(userMap);

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
    fetchLeaveData();
  }, [fetchLeaveData]);

  const handleStatusChange = async (leaveId, newStatus) => {
    const adminRemarks = remarks[leaveId] || '-';
    try {
      await updateLeaveStatus(leaveId, newStatus, adminRemarks);
      // Optimistically update UI
      setLeaves(prevLeaves =>
        prevLeaves.map(leave =>
          leave.id === leaveId ? { ...leave, status: newStatus } : leave
        )
      );
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
    setRemarks(prevRemarks => ({
      ...prevRemarks,
      [currentLeaveId]: e.target.value,
    }));
  };

  const handleSaveRemarks = async () => {
    const leaveToUpdate = leaves.find(l => l.id === currentLeaveId);
    if (!leaveToUpdate) return;
    
    const newStatus = leaveToUpdate.status;
    const adminRemarks = remarks[currentLeaveId];

    try {
      await updateLeaveStatus(currentLeaveId, newStatus, adminRemarks);
      setShowModal(false);
      // Optimistically update remarks in the UI
      setLeaves(prevLeaves =>
        prevLeaves.map(leave =>
          leave.id === currentLeaveId ? { ...leave, adminRemarks: adminRemarks } : leave
        )
      );
    } catch (err) {
      console.error("Error saving remarks:", err);
      setError('Failed to save remarks.');
    }
  };


  if (loading) return <div className="loading">Loading leaves...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Leave Requests</h1>
      </div>
      <div className="card">
        {leaves.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave.id}>
                  <td>{users[leave.studentId]?.name || 'N/A'}</td>
                  <td>{users[leave.studentId]?.rollNo || 'N/A'}</td>
                  <td>{leave.fromDate}</td>
                  <td>{leave.toDate}</td>
                  <td>{leave.reason}</td>
                  <td>
                    <select
                      value={leave.status}
                      onChange={(e) => handleStatusChange(leave.id, e.target.value)}
                      className={`status-select status-${leave.status.toLowerCase()}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="actions-cell">
                    <button onClick={() => openModal(leave.id)} className="btn-add-remarks">Remarks</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No leave requests found.</p>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add/Edit Remarks</h3>
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


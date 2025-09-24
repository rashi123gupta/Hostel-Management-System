import React, { useState, useEffect } from 'react';
import { getAllLeaves, updateLeaveStatus } from '../../../services/leaveService';
import { getAllUsers } from '../../../services/userService';
import '../../../styles/global.css';

function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState({});
  const [leaveStatus, setLeaveStatus] = useState({}); // To track local status changes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaves = async () => {
    try {
      const [fetchedLeaves, fetchedUsers] = await Promise.all([
        getAllLeaves(),
        getAllUsers()
      ]);

      const userMap = fetchedUsers.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {});
      
      setLeaves(fetchedLeaves);
      setUsers(userMap);
      
      // Initialize local status state
      const initialStatus = fetchedLeaves.reduce((acc, leave) => {
        acc[leave.id] = leave.status;
        return acc;
      }, {});
      setLeaveStatus(initialStatus);

    } catch (err) {
      setError('Failed to fetch leave data.');
      console.error("Error fetching leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusChange = (leaveId, newStatus) => {
    setLeaveStatus(prevStatus => ({
      ...prevStatus,
      [leaveId]: newStatus,
    }));
  };

  const handleSaveChanges = async (leaveId, originalStatus) => {
    const newStatus = leaveStatus[leaveId];
    if (newStatus && newStatus !== originalStatus) {
      try {
        await updateLeaveStatus(leaveId, newStatus);
        alert(`Leave request updated to ${newStatus} successfully!`);
        fetchLeaves(); // Refresh the list
      } catch (err) {
        console.error("Error updating leave status:", err);
        setError('Failed to update leave status.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading leaves...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Manage Leave Requests</h1>
      <div className="card">
        {leaves.length > 0 ? (
          <table className="user-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Hostel No</th>
                <th>Room No</th>
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
                  <td>{users[leave.studentId]?.hostelNo || 'N/A'}</td>
                  <td>{users[leave.studentId]?.roomNo || 'N/A'}</td>
                  <td>{leave.fromDate}</td>
                  <td>{leave.toDate}</td>
                  <td>{leave.reason}</td>
                  <td>
                    <select
                      value={leaveStatus[leave.id] || leave.status}
                      onChange={(e) => handleStatusChange(leave.id, e.target.value)}
                      className={`status-select status-${leaveStatus[leave.id]?.toLowerCase() || leave.status.toLowerCase()}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    {leaveStatus[leave.id] !== leave.status && (
                      <button 
                        onClick={() => handleSaveChanges(leave.id, leave.status)}
                        className="btn-save-role"
                      >
                        Save
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No leave requests found.</p>
        )}
      </div>
    </div>
  );
}

export default AdminLeaves;

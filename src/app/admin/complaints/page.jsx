import React, { useState, useEffect } from 'react';
import { getAllComplaints, updateComplaintStatus } from '../../../services/complaintService';
import { getAllUsers } from '../../../services/userService';

function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState({});
  const [remarks, setRemarks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaintsData = async () => {
    setLoading(true);
    try {
      const [fetchedComplaints, fetchedUsers] = await Promise.all([
        getAllComplaints(),
        getAllUsers()
      ]);

      const userMap = fetchedUsers.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {});
      
      setComplaints(fetchedComplaints);
      setUsers(userMap);
      
      const initialRemarks = fetchedComplaints.reduce((acc, complaint) => {
        acc[complaint.id] = complaint.resolutionDetails || '';
        return acc;
      }, {});
      setRemarks(initialRemarks);

    } catch (err) {
      setError('Failed to fetch complaint data.');
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintsData();
  }, []);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      const complaint = complaints.find(c => c.id === complaintId);
      await updateComplaintStatus(complaintId, newStatus, complaint.resolutionDetails);
      // Refresh data to show changes
      fetchComplaintsData(); 
    } catch (err) {
      console.error("Error updating complaint status:", err);
      setError('Failed to update complaint status.');
    }
  };

  const openModal = (complaint) => {
    setCurrentComplaint(complaint);
    setShowModal(true);
  };

  const handleSaveRemarks = async () => {
    if (!currentComplaint) return;
    
    try {
      await updateComplaintStatus(
        currentComplaint.id,
        currentComplaint.status,
        remarks[currentComplaint.id]
      );
      setShowModal(false);
      setCurrentComplaint(null);
      // Refresh data
      fetchComplaintsData(); 
    } catch (err) {
      console.error("Error saving remarks:", err);
      setError('Failed to save remarks.');
    }
  };

  if (loading) return <div className="loading">Loading complaints...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Complaints</h1>
      </div>
      <div className="card">
        {complaints.length > 0 ? (
          <table className="user-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(complaint => (
                <tr key={complaint.id}>
                  <td>{users[complaint.studentId]?.name || 'N/A'}</td>
                  <td>{users[complaint.studentId]?.rollNo || 'N/A'}</td>
                  <td>{complaint.description}</td>
                  <td>
                    <select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                      className={`status-select status-${complaint.status.toLowerCase()}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="actions-cell">
                    <button onClick={() => openModal(complaint)} className="btn-add-remarks">
                      Remarks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No complaints found.</p>
        )}
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add/Edit Remarks</h3>
            <textarea
              className="remarks-textarea"
              rows="4"
              value={remarks[currentComplaint.id] || ''}
              onChange={(e) => setRemarks({...remarks, [currentComplaint.id]: e.target.value})}
              placeholder="Enter your remarks here..."
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

export default AdminComplaints;

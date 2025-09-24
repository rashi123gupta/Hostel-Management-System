import React, { useState, useEffect } from 'react';
import { getAllComplaints, updateComplaintStatus } from '../../../services/complaintService';
import { getAllUsers } from '../../../services/userService';
import '../../../styles/global.css';

function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState({});
  const [complaintStatus, setComplaintStatus] = useState({});
  const [remarks, setRemarks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentComplaintId, setCurrentComplaintId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
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
      
      const initialStatus = fetchedComplaints.reduce((acc, complaint) => {
        acc[complaint.id] = complaint.status;
        return acc;
      }, {});
      setComplaintStatus(initialStatus);

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
    fetchComplaints();
  }, []);

  const handleStatusChange = async (complaintId, newStatus) => {
    const originalStatus = complaints.find(c => c.id === complaintId).status;
    const resolutionDetails = remarks[complaintId] || '';

    try {
      await updateComplaintStatus(complaintId, newStatus, resolutionDetails);
      setComplaintStatus(prevStatus => ({
        ...prevStatus,
        [complaintId]: newStatus,
      }));
      alert(`Complaint status updated to ${newStatus} successfully!`);
    } catch (err) {
      console.error("Error updating complaint status:", err);
      setError('Failed to update complaint status.');
    }
  };

  const openModal = (complaintId) => {
    setCurrentComplaintId(complaintId);
    setShowModal(true);
  };

  const handleRemarksChange = (e) => {
    setRemarks(prevRemarks => ({
      ...prevRemarks,
      [currentComplaintId]: e.target.value,
    }));
  };

  const handleSaveRemarks = async () => {
    const complaintToUpdate = complaints.find(c => c.id === currentComplaintId);
    const newStatus = complaintStatus[currentComplaintId];
    const resolutionDetails = remarks[currentComplaintId];
    try {
      await updateComplaintStatus(currentComplaintId, newStatus, resolutionDetails);
      setShowModal(false);
      alert('Remarks saved successfully!');
      fetchComplaints(); // Refresh to show changes
    } catch (err) {
      console.error("Error saving remarks:", err);
      setError('Failed to save remarks.');
    }
  };

  if (loading) {
    return <div className="loading">Loading complaints...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Manage Complaints</h1>
      <div className="card" style={{ maxWidth: '1200px' }}>
        {complaints.length > 0 ? (
          <table className="user-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Hostel No</th>
                <th>Room No</th>
                <th>Description</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(complaint => (
                <tr key={complaint.id}>
                  <td>{users[complaint.studentId]?.name || 'N/A'}</td>
                  <td>{users[complaint.studentId]?.rollNo || 'N/A'}</td>
                  <td>{users[complaint.studentId]?.hostelNo || 'N/A'}</td>
                  <td>{users[complaint.studentId]?.roomNo || 'N/A'}</td>
                  <td>{complaint.details}</td>
                  <td>
                    <select
                      value={complaintStatus[complaint.id] || complaint.status}
                      onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                      className={`status-select status-${complaintStatus[complaint.id]?.toLowerCase() || complaint.status.toLowerCase()}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => openModal(complaint.id)} className="btn-add-remarks">Add</button>
                  </td>
                  <td>
                    {/* The Save button is now inside the modal */}
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
            <h3>Add Remarks</h3>
            <textarea
              className="remarks-textarea"
              rows="4"
              value={remarks[currentComplaintId] || ''}
              onChange={handleRemarksChange}
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

import React, { useState, useEffect, useCallback } from 'react';
// --- MODIFICATION: Import the new listener ---
import { onAllComplaintsChange, updateComplaintStatus } from '../../../services/complaintService';
import { getAllUsers } from '../../../services/userService';

function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState({});
  const [complaintStatus, setComplaintStatus] = useState({});
  const [remarks, setRemarks] = useState({}); 
  const [showModal, setShowModal] = useState(false);
  const [currentComplaintId, setCurrentComplaintId] = useState(null);
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
      setError('Failed to fetch user data. Complaints may not show names.');
    }
  }, []);

  // --- MODIFICATION: This useEffect now sets up the real-time listener ---
  useEffect(() => {
    setLoading(true);
    // Fetch the user map first
    fetchUsers();

    // Set up the real-time listener for complaints
    const unsubscribe = onAllComplaintsChange(
      (sortedComplaints) => {
        // This is the success callback
        setComplaints(sortedComplaints);

        // We still need to initialize the local state for statuses/remarks
        const initialStatus = sortedComplaints.reduce((acc, c) => ({ ...acc, [c.id]: c.status }), {});
        const initialRemarks = sortedComplaints.reduce((acc, c) => ({ ...acc, [c.id]: c.resolutionDetails || '' }), {});
        
        setComplaintStatus(initialStatus);
        setRemarks(initialRemarks);

        setLoading(false);
      },
      (err) => {
        // This is the error callback
        console.error(err);
        setError('Failed to load complaints.');
        setLoading(false);
      }
    );

    // Cleanup function runs when component unmounts
    return () => {
      unsubscribe();
    };
  }, [fetchUsers]); // Run this effect only once on mount

  const handleStatusChange = async (complaintId, newStatus) => {
// ... (existing code is correct) ...
    setComplaintStatus(prev => ({ ...prev, [complaintId]: newStatus }));
    try {
      await updateComplaintStatus(complaintId, newStatus, remarks[complaintId] || '-');
      alert('Status updated successfully!');
    } catch (err) {
      setComplaintStatus(prev => ({ ...prev, [complaintId]: complaints.find(c => c.id === complaintId).status }));
      console.error("Error updating complaint status:", err);
      setError('Failed to update status.');
    }
  };

  const openModal = (complaintId) => {
// ... (existing code is correct) ...
    setCurrentComplaintId(complaintId);
    setShowModal(true);
  };

  const handleRemarksChange = (e) => {
// ... (existing code is correct) ...
    setRemarks(prev => ({ ...prev, [currentComplaintId]: e.target.value }));
  };

  const handleSaveRemarks = async () => {
// ... (existing code is correct) ...
    if (!currentComplaintId) return;
    
    try {
      const currentStatus = complaintStatus[currentComplaintId];
      const newRemarks = remarks[currentComplaintId];

      await updateComplaintStatus(currentComplaintId, currentStatus, newRemarks);
      
      setShowModal(false);
      alert('Remarks saved successfully!');
    } catch (err) {
      console.error("Error saving remarks:", err);
      setError('Failed to save remarks.');
    }
  };

  const formatDate = (timestamp) => {
// ... (existing code is correct) ...
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('en-GB'); // DD/MM/YYYY
    }
    return 'N/A';
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
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Description</th>
                <th>Status</th>
                <th>Resolution Details</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(complaint => {
                const student = users[complaint.studentId];
                const displayRemarks = (remarks[complaint.id] && remarks[complaint.id] !== '-') 
                  ? `${remarks[complaint.id].substring(0, 15)}...` 
                  : '-';

                return (
                  <tr key={complaint.id}>
                    <td>{formatDate(complaint.createdAt)}</td>
                    <td>{student?.name || 'N/A'}</td>
                    <td>{student?.rollNo || 'N/A'}</td>
                    <td>{complaint.description}</td>
                    <td>
                      <select
                        value={complaintStatus[complaint.id] || complaint.status}
                        onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                        className={`status-select status-${(complaintStatus[complaint.id] || complaint.status).toLowerCase()}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <span>{displayRemarks}</span>
                        <button onClick={() => openModal(complaint.id)} className="btn-add-remarks">Edit</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No complaints found.</p>
        )}
      </div>
      {showModal && (
        <div className="modal">
{/* ... (existing code is correct) ... */}
          <div className="modal-content">
            <h3>Add/Edit Remarks</h3>
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
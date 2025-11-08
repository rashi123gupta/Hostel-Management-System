import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllUsers, updateUserStatus } from '../../../services/userService';
import { useAuth } from '../../../context/AuthContext';
import AddUserModal from '../../../components/AddUserModal.jsx';
import EditUserModal from '../../../components/EditUserModal.jsx'; 
import '../../../styles/global.css';

function SuperuserUsersPage() {
  const { userProfile } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- MODIFICATION: Read navigation state to set default tab ---
  const location = useLocation();
  const [viewRole, setViewRole] = useState(location.state?.defaultRole || 'warden');
  const [viewStatus, setViewStatus] = useState('active');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const fetchAllUsers = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      const otherUsers = fetchedUsers.filter(user => user.id !== userProfile.id);
      setAllUsers(otherUsers);
    } catch (err) {
      setError('Failed to fetch user data.');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const handleStatusUpdate = async (userId, newStatus) => {
    setAllUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    try {
      await updateUserStatus(userId, newStatus);
      alert(`Warden has been ${newStatus === 'active' ? 'Restored' : 'Removed'}.`);
    } catch (err) {
      setError(`Failed to update warden status.`);
      setAllUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, status: newStatus === 'active' ? 'inactive' : 'active' } : user
        )
      );
    }
  };

  const openEditModal = (user) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const wardens = allUsers.filter(user => user.role === 'warden');
  const students = allUsers.filter(user => user.role === 'student');

  let usersToDisplay = [];
  if (viewRole === 'warden') {
    usersToDisplay = viewStatus === 'active' 
      ? wardens.filter(user => user.status === 'active')
      : wardens.filter(user => user.status === 'inactive');
  } else { 
    usersToDisplay = viewStatus === 'active' 
      ? students.filter(user => user.status === 'active')
      : students.filter(user => user.status === 'inactive');
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Users</h1>
        {viewRole === 'warden' && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
            Add New Warden
          </button>
        )}
      </div>

      <div className="tab-container">
        <div>
          <button 
            className={`tab-btn ${viewRole === 'warden' ? 'active' : ''}`}
            onClick={() => setViewRole('warden')}
          >
            Wardens ({wardens.length})
          </button>
          <button 
            className={`tab-btn ${viewRole === 'student' ? 'active' : ''}`}
            onClick={() => setViewRole('student')}
          >
            Students ({students.length})
          </button>
        </div>
        
        <div className="status-filter-container">
          <label htmlFor="status-filter">Show:</label>
          <select 
            id="status-filter"
            className="status-filter-select"
            value={viewStatus}
            onChange={(e) => setViewStatus(e.target.value)}
          >
            <option value="active">Current</option>
            <option value="inactive">Past</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading users...</div> :
         error ? <div className="error-message">{error}</div> :
         usersToDisplay.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                {viewRole === 'student' && <th>Roll No</th>}
                <th>Email</th>
                {viewRole === 'warden' && <th>Status</th>}
                {viewRole === 'student' && <th>Hostel No</th>}
                {viewRole === 'student' && <th>Room No</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersToDisplay.map(user => (
                <tr key={user.id}>
                  {viewRole === 'student' && <td>{user.rollNo || 'N/A'}</td>}
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  {viewRole === 'warden' &&
                  <td>
                    <span className={`status-badge status-${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td> }
                  {viewRole === 'student' && <td>{user.hostelNo || 'N/A'}</td>}
                  {viewRole === 'student' && <td>{user.roomNo || 'N/A'}</td>}
                  <td>
                    {viewRole === 'warden' ? (
                      <>
                        <button 
                          onClick={() => openEditModal(user)}
                          className="btn-add-remarks"
                        >
                          Edit
                        </button>
                        
                        {viewStatus === 'active' ? (
                          <button 
                            onClick={() => handleStatusUpdate(user.id, 'inactive')}
                            className="btn-remove" 
                          >
                            Remove
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusUpdate(user.id, 'active')}
                            className="btn-restore"
                          >
                            Restore
                          </button>
                        )}
                      </>
                    ) : (
                      <span>(Read-only)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No {viewStatus === 'active' ? 'Current' : 'Past'} {viewRole}s found.</p>
        )}
      </div>

      {isAddModalOpen && (
        <AddUserModal 
          onClose={() => setIsAddModalOpen(false)}
          onUserAdded={fetchAllUsers} 
          roleToCreate="warden"
        />
      )}

      {isEditModalOpen && (
        <EditUserModal
          onClose={() => setIsEditModalOpen(false)}
          onUserUpdated={fetchAllUsers} 
          userToEdit={userToEdit}
        />
      )}
    </div>
  );
}

export default SuperuserUsersPage;
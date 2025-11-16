import React, { useState, useEffect, useCallback } from 'react';
import { getUsersByRole, updateUserStatus } from '../../../services/userService';
import AddUserModal from '../../../components/AddUserModal.jsx';
import EditUserModal from '../../../components/EditUserModal.jsx'; 
import '../../../styles/global.css';

// This component is now ONLY for Wardens managing Students
function WardenUsersPage() {
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewStatus, setViewStatus] = useState('active'); // 'active' or 'inactive'

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Fetches ONLY students
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      // Use the specific function to get only students
      const fetchedStudents = await getUsersByRole('student');
      setAllStudents(fetchedStudents);
    } catch (err) {
      setError('Failed to fetch student data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handles activating/deactivating a student
  const handleStatusUpdate = async (userId, newStatus) => {
    setAllStudents(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    try {
      await updateUserStatus(userId, newStatus);
      alert(`Student has been ${newStatus === 'active' ? 'Restored' : 'Removed'}.`);
    } catch (err) {
      setError(`Failed to update student status.`);
      // Revert on error
      setAllStudents(prevUsers => 
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

  const sortStudentsByRollNo = (a, b) => {
    const rollA = a.rollNo || '';
    const rollB = b.rollNo || '';
    // 'numeric: true' correctly sorts strings that contain numbers
    return rollA.localeCompare(rollB, undefined, { numeric: true });
  };

  // Filter and Sort lists for the tabs 
  const activeStudents = allStudents
    .filter(user => user.status === 'active')
    .sort(sortStudentsByRollNo); // Sort the active list

  const inactiveStudents = allStudents
    .filter(user => user.status === 'inactive')
    .sort(sortStudentsByRollNo); // Sort the inactive list

  const usersToDisplay = viewStatus === 'active' ? activeStudents : inactiveStudents;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Students</h1>
        {/*
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
          Add New Student
        </button>
        */}
      </div>

      <div className="tab-container warden-tabs">
        <button 
          className={`tab-btn ${viewStatus === 'active' ? 'active' : ''}`}
          onClick={() => setViewStatus('active')}
        >
          Current Students ({activeStudents.length})
        </button>
        <button 
          className={`tab-btn ${viewStatus === 'inactive' ? 'active' : ''}`}
          onClick={() => setViewStatus('inactive')}
        >
          Past Students ({inactiveStudents.length})
        </button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading students...</div> :
         error ? <div className="error-message">{error}</div> :
         usersToDisplay.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Hostel</th>
                <th>Room</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersToDisplay.map(user => (
                <tr key={user.id}>
                  <td>{user.rollNo || 'N/A'}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.hostelNo || 'N/A'}</td>
                  <td>{user.roomNo || 'N/A'}</td>
                  <td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No {viewStatus === 'active' ? 'Current' : 'Past'} students found.</p>
        )}
      </div>

      {isAddModalOpen && (
        <AddUserModal 
          onClose={() => setIsAddModalOpen(false)}
          onUserAdded={fetchStudents} 
          roleToCreate="student"
        />
      )}

      {isEditModalOpen && (
        <EditUserModal 
          onClose={() => setIsEditModalOpen(false)}
          onUserUpdated={fetchStudents} 
          userToEdit={userToEdit}
        />
      )}
    </div>
  );
}

export default WardenUsersPage;
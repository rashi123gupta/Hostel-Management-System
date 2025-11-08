import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, updateUserProfile } from '../../../services/userService';
import { useAuth } from '../../../context/AuthContext';
import AddStudentModal from '../../../components/AddStudentModal.jsx'; // Import the new modal
import '../../../styles/global.css';

function AdminUsers() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Renamed function for clarity
  const fetchUsersData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      
      let filteredUsers = [];
      if (userProfile.role === 'superuser') {
        // Superuser sees Wardens
        filteredUsers = fetchedUsers.filter(user => user.role === 'warden');
      } else if (userProfile.role === 'warden') {
        // Warden sees Students
        filteredUsers = fetchedUsers.filter(user => user.role === 'student');
      }
      
      setUsers(filteredUsers);

      const initialRoles = filteredUsers.reduce((acc, user) => {
        acc[user.id] = user.role;
        return acc;
      }, {});
      setUserRoles(initialRoles);

    } catch (err) {
      setError('Failed to fetch user data.');
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]); // Depend on userProfile

  useEffect(() => {
    if (userProfile) { // Only run if userProfile is available
      fetchUsersData();
    }
  }, [userProfile, fetchUsersData]); // Add userProfile to dependency array

  const handleRoleChange = (userId, newRole) => {
    setUserRoles(prevRoles => ({ ...prevRoles, [userId]: newRole }));
  };

  const handleSaveChanges = async (userId) => {
    const newRole = userRoles[userId];
    if (newRole) {
      try {
        await updateUserProfile(userId, { role: newRole });
        alert('User role updated successfully!');
        fetchUsersData(); // Refresh the list
      } catch (err) {
        console.error("Error updating user role:", err);
        setError('Failed to update user role.');
      }
    }
  };

  // Determine what to show based on the admin's role
  const isSuperuser = userProfile?.role === 'superuser';
  const pageTitle = isSuperuser ? 'Manage Wardens' : 'Manage Students';
  const buttonText = isSuperuser ? 'Add New Warden' : 'Add New Student';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{pageTitle}</h1>
        {userProfile?.role === 'warden' && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            {buttonText}
          </button>
        )}
      </div>
      <div className="card">
        {loading ? <div className="loading">Loading users...</div> :
         error ? <div className="error-message">{error}</div> :
         users.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                {userProfile?.role === 'warden' && <th>Roll No</th>}
                {userProfile?.role === 'warden' && <th>Hostel</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {isSuperuser ? (
                      // Superuser can change a Warden's role (e.g., to 'student')
                      <select
                        value={userRoles[user.id] || user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="warden">Warden</option>
                        <option value="student">Student</option>
                      </select>
                    ) : (
                      // Warden just sees the role as text
                      <span>{user.role}</span>
                    )}
                  </td>
                  {userProfile?.role === 'warden' && <td>{user.rollNo}</td>}
                  {userProfile?.role === 'warden' && <td>{user.hostelNo}</td>}
                  <td>
                    {userRoles[user.id] !== user.role && (
                      <button 
                        onClick={() => handleSaveChanges(user.id)}
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
          <p>No users found.</p>
        )}
      </div>

      {isModalOpen && (
        <AddStudentModal 
          onClose={() => setIsModalOpen(false)}
          onStudentAdded={fetchUsersData} // Refresh the user list on success
        />
      )}
    </div>
  );
}

export default AdminUsers;
import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserProfile } from '../../../services/userService';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/global.css';

function AdminUsers() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState({}); // New state to track role changes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getAllUsers();
      // Filter out the currently logged-in admin from the list
      const otherUsers = fetchedUsers.filter(user => user.id !== currentUser.uid);
      setUsers(otherUsers);

      // Initialize userRoles state from fetched data
      const initialRoles = otherUsers.reduce((acc, user) => {
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
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const handleRoleChange = (userId, newRole) => {
    setUserRoles(prevRoles => ({
      ...prevRoles,
      [userId]: newRole,
    }));
  };

  const handleSaveChanges = async (userId) => {
    const newRole = userRoles[userId];
    if (newRole) {
      try {
        await updateUserProfile(userId, { role: newRole });
        alert('User role updated successfully!');
        // Update the local state to reflect the change
        setUsers(prevUsers =>
          prevUsers.map(user => user.id === userId ? { ...user, role: newRole } : user)
        );
      } catch (err) {
        console.error("Error updating user role:", err);
        setError('Failed to update user role.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Manage Students</h1>
      <div className="card">
        {users.length > 0 ? (
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Hostel No</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const isCurrentUser = user.id === currentUser?.uid;
                return (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.rollNo}</td>
                    <td>{user.hostelNo}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={userRoles[user.id] || user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="role-select"
                        disabled={isCurrentUser}
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      {userRoles[user.id] !== user.role && !isCurrentUser && (
                        <button 
                          onClick={() => handleSaveChanges(user.id)}
                          className="btn-save-role"
                        >
                          Save
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No other users found.</p>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;

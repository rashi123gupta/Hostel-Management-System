import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, updateUserProfile } from '../../../services/userService';
import { useAuth } from '../../../context/AuthContext';

function AdminUsers() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Wrap fetchUsersData in useCallback to stabilize the function reference
  const fetchUsersData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      // Filter out the currently logged-in admin from the list
      const otherUsers = fetchedUsers.filter(user => user.id !== currentUser.uid);
      setUsers(otherUsers);
    } catch (err) {
      setError('Failed to fetch user data.');
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]); // Dependency on currentUser

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]); // Now the dependency is stable

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserProfile(userId, { role: newRole });
      // Update the local state to reflect the change without a full refetch
      setUsers(prevUsers =>
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error("Error updating user role:", err);
      setError('Failed to update user role.');
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Users</h1>
      </div>
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
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.rollNo || 'N/A'}</td>
                  <td>{user.hostelNo || 'N/A'}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
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


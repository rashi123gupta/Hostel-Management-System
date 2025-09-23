// src/app/admin/dashboard/page.jsx
import React from 'react';
import { useAuth } from '../../../context/AuthContext';

function AdminDashboard() {
  const { userProfile } = useAuth();
  return (
    <div>
      <h1>Welcome to the Admin Dashboard</h1>
      <p>Hello, {userProfile?.name}!</p>
      {/* Admin features will go here */}
    </div>
  );
}

export default AdminDashboard;

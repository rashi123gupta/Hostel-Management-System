// src/app/student/dashboard/page.jsx
import React from 'react';
import { useAuth } from '../../../context/AuthContext';

function StudentDashboard() {
  const { userProfile } = useAuth();
  return (
    <div>
      <h1>Welcome to the Student Dashboard</h1>
      <p>Hello, {userProfile?.name}!</p>
      {/* Student features will go here */}
    </div>
  );
}

export default StudentDashboard;

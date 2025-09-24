import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getAllComplaints } from '../../../services/complaintService';
import { getAllLeaves } from '../../../services/leaveService';
import { getAllUsers } from '../../../services/userService';
import '../../../styles/global.css';

function AdminDashboard() {
  const { userProfile } = useAuth();
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    totalLeaves: 0,
    pendingLeaves: 0,
  });

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      // Fetch all users
      const allUsers = await getAllUsers();
      const students = allUsers.filter(u => u.role === 'student');
      
      // Fetch all complaints
      const allComplaints = await getAllComplaints();
      const pendingComplaints = allComplaints.filter(c => c.status === 'Pending').length;

      // Fetch all leaves
      const allLeaves = await getAllLeaves();
      const pendingLeaves = allLeaves.filter(l => l.status === 'Pending').length;
      
      setSummary({
        totalStudents: students.length,
        totalComplaints: allComplaints.length,
        pendingComplaints,
        totalLeaves: allLeaves.length,
        pendingLeaves,
      });
    };

    fetchAdminDashboardData();
  }, []);

  return (
    <div className="page-content">
      {/* Profile Details Card */}
      <div className="user-profile-container card">
        <div className="profile-image">
          <img 
            src="https://logowik.com/content/uploads/images/t_blue-member-icon9937.logowik.com.webp"
            alt="Admin Profile" 
          />
        </div>
        <div className="user-details-card">
          <h2 className="user-name">{userProfile?.name}</h2>
          <p className="user-info">Role: {userProfile?.role}</p>
          <p className="user-info">Email: {userProfile?.email}</p>
        </div>
      </div>
    
      {/* Complaints Summary Card */}
      <div className="summary-card card">
        <h3>Complaints</h3>
        <p>Total Complaints: {summary.totalComplaints}</p>
        <p>Pending Complaints: {summary.pendingComplaints}</p>
      </div>

      {/* Leaves Summary Card */}
      <div className="summary-card card">
        <h3>Leaves</h3>
        <p>Total Leaves: {summary.totalLeaves}</p>
        <p>Pending Leaves: {summary.pendingLeaves}</p>
      </div>

      {/* Present Students */}
      <div className="summary-card card">
        <h3>Present Students</h3>
        <p>Total Students: {summary.totalLeaves}</p>
        <p>Present: {summary.pendingLeaves}</p>
        <p>Not Present: {summary.pendingLeaves}</p>
      </div>
    </div>
  );
}

export default AdminDashboard;

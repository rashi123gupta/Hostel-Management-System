import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getAllComplaints } from '../../../services/complaintService';
import { getAllLeaves } from '../../../services/leaveService';
import { getAllUsers } from '../../../services/userService';

function AdminDashboard() {
  const { userProfile } = useAuth();
  const [summary, setSummary] = useState({
    totalStudents: 0,
    studentsOnLeave: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    totalLeaves: 0,
    pendingLeaves: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        const [allUsers, allComplaints, allLeaves] = await Promise.all([
          getAllUsers(),
          getAllComplaints(),
          getAllLeaves()
        ]);

        const students = allUsers.filter(u => u.role === 'student');
        const pendingComplaints = allComplaints.filter(c => c.status === 'Pending').length;
        const pendingLeaves = allLeaves.filter(l => l.status === 'Pending').length;
        const studentsOnLeave = allLeaves.filter(l => l.status === 'Approved').length;
        
        setSummary({
          totalStudents: students.length,
          studentsOnLeave: studentsOnLeave,
          totalComplaints: allComplaints.length,
          pendingComplaints,
          totalLeaves: allLeaves.length,
          pendingLeaves,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading Dashboard...</div>;
  }

  return (
    <div className="page-container">
      {/* Profile Details Card */}
      <div className="user-profile-container card">
        <div className="profile-image">
          <img 
            src="https://logowik.com/content/uploads/images/t_blue-member-icon9937.logowik.com.webp"
            alt="Admin Profile" 
          />
        </div>
        <div className="user-details-card">
          <h2 className="user-name">{userProfile?.name || 'Admin'}</h2>
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
        <h3>Student Attendance</h3>
        <p>Total Students: {summary.totalStudents}</p>
        <p>Students on Leave: {summary.studentsOnLeave}</p>
        <p>Present: {summary.totalStudents - summary.studentsOnLeave}</p>
      </div>
    </div>
  );
}

export default AdminDashboard;


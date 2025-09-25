import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getAllComplaints } from '../../../services/complaintService';
import { getAllLeaves } from '../../../services/leaveService';
import { getAllUsers } from '../../../services/userService';

// Helper function to parse 'DD-MM-YYYY' strings into Date objects
const parseDate = (dateString) => {
  const [day, month, year] = dateString.split('-').map(Number);
  // JavaScript months are 0-indexed (0=Jan, 1=Feb, etc.)
  return new Date(year, month - 1, day);
};

function AdminDashboard() {
  const { userProfile } = useAuth();
  const [summary, setSummary] = useState({
    totalStudents: 0,
    presentStudents: 0,
    studentsOnLeave: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch all necessary data in parallel
      const [allUsers, allComplaints, allLeaves] = await Promise.all([
        getAllUsers(),
        getAllComplaints(),
        getAllLeaves(),
      ]);

      // --- 1. Calculate Student Stats ---
      const students = allUsers.filter(u => u.role === 'student');
      const totalStudents = students.length;

      // Determine who is currently on an approved leave
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to the start of the day

      const studentsOnLeave = allLeaves.filter(leave => {
        if (leave.status !== 'Approved') return false;
        const fromDate = parseDate(leave.fromDate);
        const toDate = parseDate(leave.toDate);
        return today >= fromDate && today <= toDate;
      }).length;
      
      const presentStudents = totalStudents - studentsOnLeave;

      // --- 2. Calculate Complaint Stats ---
      const totalComplaints = allComplaints.length;
      const pendingComplaints = allComplaints.filter(c => c.status === 'Pending').length;
      const resolvedComplaints = allComplaints.filter(c => c.status === 'Resolved').length;
      
      // --- 3. Calculate Leave Stats ---
      const totalLeaves = allLeaves.length;
      const pendingLeaves = allLeaves.filter(l => l.status === 'Pending').length;
      const approvedLeaves = allLeaves.filter(l => l.status === 'Approved').length;
      const rejectedLeaves = allLeaves.filter(l => l.status === 'Rejected').length;
      
      // --- 4. Update State ---
      setSummary({
        totalStudents,
        presentStudents,
        studentsOnLeave,
        totalComplaints,
        pendingComplaints,
        resolvedComplaints,
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves
      });

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) return <div className="loading">Loading Dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

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
    
      {/* Student Summary Card */}
      <div className="summary-card card">
        <h3>Student Attendance</h3>
        <p>Total Students: {summary.totalStudents}</p>
        <p>Present: {summary.presentStudents}</p>
        <p>On Leave: {summary.studentsOnLeave}</p>
      </div>

      {/* Complaints Summary Card */}
      <div className="summary-card card">
        <h3>Complaints Overview</h3>
        <p>Total Complaints: {summary.totalComplaints}</p>
        <p>Pending: {summary.pendingComplaints}</p>
        <p>Resolved: {summary.resolvedComplaints}</p>
      </div>

      {/* Leaves Summary Card */}
      <div className="summary-card card">
        <h3>Leaves Overview</h3>
        <p>Total Requests: {summary.totalLeaves}</p>
        <p>Pending: {summary.pendingLeaves}</p>
        <p>Approved: {summary.approvedLeaves}</p>
        <p>Rejected: {summary.rejectedLeaves}</p>
      </div>
    </div>
  );
}

export default AdminDashboard;


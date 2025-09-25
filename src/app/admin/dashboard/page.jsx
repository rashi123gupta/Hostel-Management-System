import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getAllComplaints } from '../../../services/complaintService';
import { getAllLeaves } from '../../../services/leaveService';
import { getAllUsers } from '../../../services/userService';
import EditProfileModal from '../../../components/EditProfileModal';
import '../../../styles/global.css';

// --- NEW, ROBUST HELPER FUNCTIONS ---

/**
 * Parses a date string in "DD-MM-YYYY" format into a reliable Date object.
 * @param {string} dateStr The date string to parse.
 * @returns {Date} A JavaScript Date object set to midnight.
 */
const parseDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  // Month is 0-indexed in JavaScript's Date object (0=Jan, 11=Dec)
  return new Date(year, month - 1, day);
};

/**
 * Checks if a given date falls within a start and end date range (inclusive).
 * @param {Date} checkDate The date to check (e.g., today).
 * @param {string} fromStr The start date string ("DD-MM-YYYY").
 * @param {string} toStr The end date string ("DD-MM-YYYY").
 * @returns {boolean} True if the date is in the range.
 */
const isDateInRange = (checkDate, fromStr, toStr) => {
  const fromDate = parseDateString(fromStr);
  const toDate = parseDateString(toStr);
  if (!checkDate || !fromDate || !toDate) return false;

  // Set the checkDate to midnight to ensure a fair comparison
  checkDate.setHours(0, 0, 0, 0);

  return checkDate >= fromDate && checkDate <= toDate;
};


function AdminDashboard() {
  const { userProfile } = useAuth();
  const [summary, setSummary] = useState({
    totalStudents: 0,
    studentsOnLeave: 0,
    presentStudents: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchAdminDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [allUsers, allComplaints, allLeaves] = await Promise.all([
        getAllUsers(),
        getAllComplaints(),
        getAllLeaves(),
      ]);

      // User & Attendance Calculations
      const students = allUsers.filter(u => u.role === 'student');
      const totalStudents = students.length;
      
      const today = new Date(); // Get today's date object
      
      const studentsOnLeave = allLeaves.filter(l => 
        l.status === 'Approved' && isDateInRange(today, l.fromDate, l.toDate)
      ).length;
      const presentStudents = totalStudents - studentsOnLeave;

      // Complaint Calculations
      const pendingComplaints = allComplaints.filter(c => c.status === 'Pending').length;
      const resolvedComplaints = allComplaints.filter(c => c.status === 'Resolved').length;

      // Leave Calculations
      const pendingLeaves = allLeaves.filter(l => l.status === 'Pending').length;
      const approvedLeaves = allLeaves.filter(l => l.status === 'Approved').length;
      const rejectedLeaves = allLeaves.filter(l => l.status === 'Rejected').length;
      
      setSummary({
        totalStudents,
        studentsOnLeave,
        presentStudents,
        totalComplaints: allComplaints.length,
        pendingComplaints,
        resolvedComplaints,
        totalLeaves: allLeaves.length,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
      });

    } catch (err) {
      setError('Could not load dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminDashboardData();
  }, [fetchAdminDashboardData]);

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
        <button onClick={() => setIsEditModalOpen(true)} className="btn-edit-profile">
          Edit Profile
        </button>
      </div>
    
      {/* Student Attendance Summary */}
      <div className="summary-card card">
        <h3>Student Attendance</h3>
        <div className="summary-grid">
          <div className="summary-item card">
            <p>Total Students</p>
            <h4>{summary.totalStudents}</h4>
          </div>
          <div className="summary-item card">
            <p>Students on Leave</p>
            <h4>{summary.studentsOnLeave}</h4>
          </div>
          <div className="summary-item card">
            <p>Present</p>
            <h4>{summary.presentStudents}</h4>
          </div>
        </div>
      </div>

      {/* Leaves Overview Summary */}
      <div className="summary-card card">
        <h3>Leaves Overview</h3>
        <div className="summary-grid">
          <div className="summary-item card">
            <p>Total</p>
            <h4>{summary.totalLeaves}</h4>
          </div>
          <div className="summary-item card">
            <p>Pending</p>
            <h4>{summary.pendingLeaves}</h4>
          </div>
          <div className="summary-item card">
            <p>Approved</p>
            <h4>{summary.approvedLeaves}</h4>
          </div>
          <div className="summary-item card">
            <p>Rejected</p>
            <h4>{summary.rejectedLeaves}</h4>
          </div>
        </div>
      </div>

      {/* Complaints Overview Summary */}
      <div className="summary-card card">
        <h3>Complaints Overview</h3>
        <div className="summary-grid">
          <div className="summary-item card">
            <p>Total</p>
            <h4>{summary.totalComplaints}</h4>
          </div>
          <div className="summary-item card">
            <p>Pending</p>
            <h4>{summary.pendingComplaints}</h4>
          </div>
          <div className="summary-item card">
            <p>Resolved</p>
            <h4>{summary.resolvedComplaints}</h4>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal 
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;


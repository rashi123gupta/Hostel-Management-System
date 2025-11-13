import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- NEW IMPORT
import { useAuth } from '../../../context/AuthContext';
import { getAllComplaints } from '../../../services/complaintService';
import { getAllLeaves } from '../../../services/leaveService';
import { getAllUsers } from '../../../services/userService';
import EditProfileModal from '../../../components/EditProfileModal';

// Helper function to parse 'DD-MM-YYYY' strings into Date objects
const parseDate = (dateString) => {
  const [day, month, year] = dateString.split('-').map(Number);
  // JavaScript months are 0-indexed (0=Jan, 1=Feb, etc.)
  return new Date(year, month - 1, day);
};

function WardenDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate(); // <--- INITIALIZE NAVIGATE
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

      // --- 1. Calculate Student Stats (MODIFIED LOGIC) ---
      
      // First, get ONLY the active students
      const activeStudents = allUsers.filter(u => u.role === 'student' && u.status === 'active');
      const totalStudents = activeStudents.length; // This is the new total

      // Create a Set of active student IDs for efficient lookup
      const activeStudentIds = new Set(activeStudents.map(s => s.id));

      // Determine who is currently on an approved leave
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to the start of the day

      const studentsOnLeave = allLeaves.filter(leave => {
        // Check if this leave belongs to an ACTIVE student
        const isLeaveFromActiveStudent = activeStudentIds.has(leave.studentId);

        if (leave.status !== 'Approved' || !isLeaveFromActiveStudent) {
          return false;
        }
        
        const fromDate = parseDate(leave.fromDate);
        const toDate = parseDate(leave.toDate);
        return today >= fromDate && today <= toDate;
      }).length;
      
      const presentStudents = totalStudents - studentsOnLeave;

      // --- 2. Calculate Complaint Stats (Unchanged) ---
      const totalComplaints = allComplaints.length;
      const pendingComplaints = allComplaints.filter(c => c.status === 'Pending').length;
      const resolvedComplaints = allComplaints.filter(c => c.status === 'Resolved').length;
      
      // --- 3. Calculate Leave Stats (Unchanged) ---
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
          <p className="user-info">Email: {userProfile?.email}</p>
        </div>
        <button onClick={() => setIsEditModalOpen(true)} className="btn-edit-profile">
          Edit Profile
        </button>
      </div>

      {/* Student Attendance - Clickable to Users Page */}
      <div 
        className="summary-card card clickable-card"
        onClick={() => navigate('/warden/users')}
      >
        <h3>Student Attendance</h3>
        <div className="summary-grid">
          <div className="summary-item card">
            <p>Total Students</p>
            {/* This now correctly shows active students */}
            <h4>{summary.totalStudents}</h4>
          </div>
          <div className="summary-item card">
            <p>Students on Leave</p>
            {/* This now correctly shows active students on leave */}
            <h4>{summary.studentsOnLeave}</h4>
          </div>
          <div className="summary-item card">
            <p>Present</p>
            {/* This now correctly shows active students present */}
            <h4>{summary.presentStudents}</h4>
          </div>
        </div>
      </div>
      
      {/* Leaves Summary Card - Clickable to Leaves Page */}
      <div 
        className="summary-card card clickable-card"
        onClick={() => navigate('/warden/leaves')}
      >
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

      {/* Complaints Summary Card - Clickable to Complaints Page */}
      <div 
        className="summary-card card clickable-card"
        onClick={() => navigate('/warden/complaints')}
      >
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

export default WardenDashboard;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getStudentComplaints } from '../../../services/complaintService';
import { getStudentLeaves } from '../../../services/leaveService';
import EditProfileModal from '../../../components/EditProfileModal';
import '../../../styles/global.css';

function StudentDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate(); 
  const [complaints, setComplaints] = useState({ total: 0, pending: 0, completed: 0 });
  const [leaves, setLeaves] = useState({ totalRequested: 0, approved: 0, rejected: 0, pending: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // The useCallback hook ensures this function is stable
  const fetchDashboardData = useCallback(async () => {
    if (userProfile?.id) {
      // Fetch complaints data
      const fetchedComplaints = await getStudentComplaints(userProfile.id);
      const pendingComplaints = fetchedComplaints.filter(c => c.status === 'Pending').length;
      const resolvedComplaints = fetchedComplaints.filter(c => c.status === 'Resolved').length;
      setComplaints({
        total: fetchedComplaints.length,
        pending: pendingComplaints,
        completed: resolvedComplaints
      });

      // Fetch leaves data
      const fetchedLeaves = await getStudentLeaves(userProfile.id);
      const approvedLeaves = fetchedLeaves.filter(l => l.status === 'Approved').length;
      const rejectedLeaves = fetchedLeaves.filter(l => l.status === 'Rejected').length;
      const pendingLeaves = fetchedLeaves.filter(l => l.status === 'Pending').length;

      setLeaves({
        totalRequested: fetchedLeaves.length,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
        pending: pendingLeaves
      });
    }
  }, [userProfile]); 

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="page-container"> 
      <div className="user-profile-container card">
        <div className="profile-image">
          <img 
            src="https://logowik.com/content/uploads/images/university-student6136.logowik.com.webp"
            alt="Student Profile" 
          />
        </div>
        <div className="user-details-card">
          <h2 className="user-name">{userProfile?.name}</h2>
          <p className="user-info">Email: {userProfile?.email}</p>
          <p className="user-info">Roll Number: {userProfile?.rollNo}</p>
          <p className="user-info">Hostel Number: {userProfile?.hostelNo}</p>
          <p className="user-info">Room Number: {userProfile?.roomNo}</p>
        </div>
        <button onClick={() => setIsEditModalOpen(true)} className="btn-edit-profile">
          Edit Profile
        </button>
      </div>

      <div 
        className="summary-card card clickable-card"
        onClick={() => navigate('/student/leaves')}
      >
        <h3>Leaves</h3>
        <div className="summary-grid">
          <div className="summary-item card">
            <p>Total</p>
            <h4>{leaves.totalRequested}</h4>
          </div>
          <div className="summary-item card">
            <p>Pending</p>
            <h4>{leaves.pending}</h4>
          </div>
          <div className="summary-item card">
            <p>Approved</p>
            <h4>{leaves.approved}</h4>
          </div>
          <div className="summary-item card">
            <p>Rejected</p>
            <h4>{leaves.rejected}</h4>
          </div>
        </div>
      </div>

      <div 
        className="summary-card card clickable-card"
        onClick={() => navigate('/student/complaints')}
      >
        <h3>Complaints</h3>
        <div className="summary-grid">
          <div className="summary-item card">
            <p>Total</p>
            <h4>{complaints.total}</h4>
          </div>
          <div className="summary-item card">
            <p>Pending</p>
            <h4>{complaints.pending}</h4>
          </div>
          <div className="summary-item card">
            <p>Resolved</p>
            <h4>{complaints.completed}</h4>
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

export default StudentDashboard;
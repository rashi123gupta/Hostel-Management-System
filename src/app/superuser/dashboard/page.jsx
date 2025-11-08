import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getAllUsers } from '../../../services/userService';
import EditProfileModal from '../../../components/EditProfileModal';
import '../../../styles/global.css';

function SuperuserDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate(); // For clickable cards
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Summary state 
  const [summary, setSummary] = useState({
    activeWardens: 0,
    inactiveWardens: 0,
    activeStudents: 0,
    inactiveStudents: 0,
  });

  // Data fetching logic
  const fetchDashboardData = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      // Filter out the superuser themselves
      const otherUsers = allUsers.filter(u => u.id !== userProfile.id);

      const wardens = otherUsers.filter(u => u.role === 'warden');
      const students = otherUsers.filter(u => u.role === 'student');

      setSummary({
        activeWardens: wardens.filter(u => u.status === 'active').length,
        inactiveWardens: wardens.filter(u => u.status === 'inactive').length,
        activeStudents: students.filter(u => u.status === 'active').length,
        inactiveStudents: students.filter(u => u.status === 'inactive').length,
      });

    } catch (err) {
      setError('Could not load dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]); 

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Functions to handle card clicks
  const handleWardenCardClick = () => {
    // No state needed, as 'warden' is the default view
    navigate('/superuser/users');
  };

  const handleStudentCardClick = () => {
    // Pass state to tell the next page to default to the 'student' tab
    navigate('/superuser/users', { state: { defaultRole: 'student' } });
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container">
      {/* Profile Details Card */}
      <div className="user-profile-container card">
        <div className="profile-image">
          <img 
            src="https://logowik.com/content/uploads/images/t_blue-member-icon9937.logowik.com.webp"
            alt="Superuser Profile" 
          />
        </div>
        <div className="user-details-card">
          <h2 className="user-name">{userProfile?.name || 'Superuser'}</h2>
          <p className="user-info">Role: {userProfile?.role}</p>
          <p className="user-info">Email: {userProfile?.email}</p>
        </div>
        <button onClick={() => setIsEditModalOpen(true)} className="btn-edit-profile">
          Edit Profile
        </button>
      </div>

      {/* Warden Overview Card */}
      <div 
        className="summary-card card clickable-card" 
        onClick={handleWardenCardClick}
      >
        <h3>Warden Overview</h3>
        <div className="summary-grid">
          <div className="summary-item card">
            <p>Current Wardens</p>
            <h4>{summary.activeWardens}</h4>
          </div>
          <div className="summary-item card">
            <p>Past Wardens</p>
            <h4>{summary.inactiveWardens}</h4>
          </div>
        </div>
      </div>

      {/* Student Overview Card */}
      <div 
        className="summary-card card clickable-card" 
        onClick={handleStudentCardClick}
      >
        <h3>Student Overview</h3>
        <div className="summary-grid">
          <div className="summary-item card">
            <p>Current Students</p>
            <h4>{summary.activeStudents}</h4>
          </div>
          <div className="summary-item card">
            <p>Past Students</p>
            <h4>{summary.inactiveStudents}</h4>
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

export default SuperuserDashboard;
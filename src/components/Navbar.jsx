import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logOut } from '../services/authService';

function Navbar() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const renderLinks = () => {
    if (!currentUser) {
      // No user, show login (Signup is removed)
      return (
        <Link to="/login">Login</Link>
      );
    }

    // Use userProfile.role to determine links
    switch (userProfile?.role) {
      case 'student':
        return (
          <>
            <Link to="/student/dashboard">Dashboard</Link>
            <Link to="/student/leaves">Leaves</Link>
            <Link to="/student/complaints">Complaints</Link>
          </>
        );
      case 'warden':
        return (
          <>
            <Link to="/warden/dashboard">Dashboard</Link>
            <Link to="/warden/users">Students</Link>
            <Link to="/warden/leaves">Leaves</Link>
            <Link to="/warden/complaints">Complaints</Link>
          </>
        );
      case 'superuser':
        return (
          <>
            <Link to="/superuser/dashboard">Dashboard</Link>
            <Link to="/superuser/wardens">Manage Wardens</Link>
          </>
        );
      default:
        // Loading or no profile, show nothing yet
        return null;
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-title">HMS</Link>
      <div className="navbar-links">
        {renderLinks()}
        {currentUser && (
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
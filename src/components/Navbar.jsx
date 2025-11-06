// src/components/Navbar.jsx
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

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-title">HMS</Link>
      <div className="navbar-links">
        {currentUser ? (
          <>
            {/* --- Admin Links --- */}
            {userProfile?.role === 'admin' && (
              <>
                <Link to="/admin/dashboard">Dashboard</Link>
                <Link to="/admin/users">Users</Link>
                <Link to="/admin/leaves">Leaves</Link>
                <Link to="/admin/complaints">Complaints</Link>
              </>
            )}

            {/* --- Student Links --- */}
            {userProfile?.role === 'student' && (
              <>
                <Link to="/student/dashboard">Dashboard</Link>
                <Link to="/student/leaves">Leaves</Link>
                <Link to="/student/complaints">Complaints</Link>
              </>
            )}
            
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            {/* --- Logged Out Links --- */}
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { currentUser, userProfile, safeSignOut } = useAuth(); // ✅ use safeSignOut
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await safeSignOut(); // ✅ clean unsubscribe before signOut
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Failed to log out:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const renderLinks = () => {
    if (!currentUser || !userProfile) return null;

    switch (userProfile.role) {
      case "student":
        return (
          <>
            <Link to="/student/dashboard">Dashboard</Link>
            <Link to="/student/leaves">Leaves</Link>
            <Link to="/student/complaints">Complaints</Link>
            <Link to="/student/messmenu">Mess Menu</Link>
            <Link to="/student/messfeedback">Mess Feedback</Link>
          </>
        );

      case "warden":
        return (
          <>
            <Link to="/warden/dashboard">Dashboard</Link>
            <Link to="/warden/users">Students</Link>
            <Link to="/warden/leaves">Leaves</Link>
            <Link to="/warden/complaints">Complaints</Link>
            <Link to="/warden/messmenu">Mess Menu</Link>
            <Link to="/warden/messsuggestions">Menu Suggestions</Link>
            <Link to="/warden/messfeedback">Mess Feedback</Link>
          </>
        );

      case "superuser":
        return (
          <>
            <Link to="/superuser/dashboard">Dashboard</Link>
            <Link to="/superuser/users">Manage Users</Link>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-title">HMS</Link>
      <div className="navbar-links">
        {renderLinks()}
        {currentUser && (
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

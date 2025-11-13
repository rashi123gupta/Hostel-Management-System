// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { messagingPromise } from "./services/firebase";
import { onMessage } from "firebase/messaging";


// Core Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Page Components
import LoginPage from './app/login/page';
// SignupPage is removed

// Student Page Components
import StudentDashboard from './app/student/dashboard/page';
import StudentLeavesPage from './app/student/leaves/page';
import StudentComplaintsPage from './app/student/complaints/page';
import StudentMessMenu from './app/student/messmenu/page.jsx';
import MessFeedbackPage from './app/student/messfeedback/page';

// Admin/Warden Page Components
import AdminDashboard from './app/admin/dashboard/page';
import WardenUsersPage from './app/admin/users/page'; // This is the Warden's page
import AdminLeaves from './app/admin/leaves/page';
import AdminComplaints from './app/admin/complaints/page';
import WardenMessFeedbackPage from './app/admin/messfeedback/page.jsx';

// Superuser Page Components
import SuperuserDashboard from './app/superuser/dashboard/page';
import SuperuserUsersPage from './app/superuser/users/page.jsx';



let onMessageListenerAdded = false;

/**
 * A component that intelligently redirects logged-in users to their
 * correct dashboard from a neutral path like "/".
 */
function DashboardRedirect() {
  const { userProfile, loading } = useAuth();

  if (loading || !userProfile) {
    return <div className="loading">Loading...</div>;
  }

  // Updated to include new roles
  switch (userProfile.role) {
    case 'superuser':
      return <Navigate to="/superuser/dashboard" replace />;
    case 'warden':
      return <Navigate to="/warden/dashboard" replace />;
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    default:
      // If role is unknown or missing, send to login
      return <Navigate to="/login" replace />;
  }
}

function App() {
  React.useEffect(() => {
  if (onMessageListenerAdded) return;
  onMessageListenerAdded = true;

  messagingPromise.then((messaging) => {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      const n = payload?.notification;
      if (n?.title) {
        alert(`${n.title}\n${n.body || ""}`);
        console.log("📩 onMessage listener attached");
      }
    });
  });
}, []);


  return (
  <Router>
    <Navbar />
    <main className="main-content">
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<LoginPage />} />

        {/* --- Protected Student Routes --- */}
        <Route 
          path="/student/dashboard" 
          element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/student/leaves" 
          element={<ProtectedRoute role="student"><StudentLeavesPage /></ProtectedRoute>} 
        />
        <Route 
          path="/student/complaints" 
          element={<ProtectedRoute role="student"><StudentComplaintsPage /></ProtectedRoute>} 
        />
        <Route 
              path="/student/messmenu" 
              element={<ProtectedRoute role="student"><StudentMessMenu /></ProtectedRoute>} 
        />
        <Route 
              path="/student/messfeedback" 
              element={<ProtectedRoute role="student"><MessFeedbackPage /></ProtectedRoute>} 
        />

        {/* --- Protected Warden Routes --- */}
        <Route 
          path="/warden/dashboard" 
          element={<ProtectedRoute role="warden"><AdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/warden/users" 
          element={<ProtectedRoute role="warden"><WardenUsersPage /></ProtectedRoute>} 
        />
        <Route 
          path="/warden/leaves" 
          element={<ProtectedRoute role="warden"><AdminLeaves /></ProtectedRoute>} 
        />
        <Route 
          path="/warden/complaints" 
          element={<ProtectedRoute role="warden"><AdminComplaints /></ProtectedRoute>} 
        />
        <Route 
              path="/warden/messfeedback" 
              element={<ProtectedRoute role="warden"><WardenMessFeedbackPage /></ProtectedRoute>} 
        />

        {/* --- Protected Superuser Routes --- */}
        <Route 
          path="/superuser/dashboard" 
          element={<ProtectedRoute role="superuser"><SuperuserDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/superuser/users" 
          element={<ProtectedRoute role="superuser"><SuperuserUsersPage /></ProtectedRoute>} 
        />

        <Route 
          path="/" 
          element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} 
        />

        <Route path="*" element={
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1>404 | Page Not Found</h1>
          </div>
        } />

      </Routes>
    </main>
  </Router>
);
}

export default App;
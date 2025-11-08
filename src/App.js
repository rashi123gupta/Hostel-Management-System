import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Core Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Page Components
import LoginPage from './app/login/page';

// Student Page Components
import StudentDashboard from './app/student/dashboard/page';
import StudentLeavesPage from './app/student/leaves/page';
import StudentComplaintsPage from './app/student/complaints/page';

// Admin/Warden Page Components
import AdminDashboard from './app/admin/dashboard/page';
import AdminUsers from './app/admin/users/page';
import AdminLeaves from './app/admin/leaves/page';
import AdminComplaints from './app/admin/complaints/page';

// Superuser Page Components
import SuperuserDashboard from './app/superuser/dashboard/page';

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
  return (
    <AuthProvider>
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

            {/* --- Protected Warden Routes --- */}
            <Route 
              path="/warden/dashboard" 
              element={<ProtectedRoute role="warden"><AdminDashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/warden/users" 
              element={<ProtectedRoute role="warden"><AdminUsers /></ProtectedRoute>} 
            />
            <Route 
              path="/warden/leaves" 
              element={<ProtectedRoute role="warden"><AdminLeaves /></ProtectedRoute>} 
            />
            <Route 
              path="/warden/complaints" 
              element={<ProtectedRoute role="warden"><AdminComplaints /></ProtectedRoute>} 
            />
            
            {/* --- Protected Superuser Route --- */}
            <Route 
              path="/superuser/dashboard" 
              element={<ProtectedRoute role="superuser"><SuperuserDashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/superuser/wardens" 
              element={<ProtectedRoute role="superuser"><AdminUsers /></ProtectedRoute>} 
            />

            {/* --- Redirect Logic --- */}
            <Route 
              path="/" 
              element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} 
            />
            
            {/* --- 404 Not Found Fallback --- */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h1>404 | Page Not Found</h1>
              </div>
            } />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Core Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Page Components
import LoginPage from './app/login/page';
import SignupPage from './app/signup/page';
import ProfilePage from './app/profile/page';

// Student Page Components
import StudentDashboard from './app/student/dashboard/page';
import StudentLeavesPage from './app/student/leaves/page';
import StudentComplaintsPage from './app/student/complaints/page';

// Admin Page Components (assuming these exist from your teammate)
import AdminDashboard from './app/admin/dashboard/page';
import AdminUsers from './app/admin/users/page';
import AdminLeaves from './app/admin/leaves/page';
import AdminComplaints from './app/admin/complaints/page';

/**
 * A component that intelligently redirects logged-in users to their
 * correct dashboard from a neutral path like "/".
 */
function DashboardRedirect() {
  const { userProfile, loading } = useAuth();

  if (loading || !userProfile) {
    // Show a loading state or nothing while user data is being fetched
    return <div>Loading...</div>;
  }

  // Redirect user based on their role
  return userProfile.role === 'admin' 
    ? <Navigate to="/admin/dashboard" replace /> 
    : <Navigate to="/student/dashboard" replace />;
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
            <Route path="/signup" element={<SignupPage />} />

            {/* --- Protected Student Routes --- */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
            } />
            <Route path="/student/leaves" element={
              <ProtectedRoute role="student"><StudentLeavesPage /></ProtectedRoute>
            } />
            <Route path="/student/complaints" element={
              <ProtectedRoute role="student"><StudentComplaintsPage /></ProtectedRoute>
            } />

            {/* --- Protected Admin Routes --- */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>
            } />
            <Route path="/admin/leaves" element={
              <ProtectedRoute role="admin"><AdminLeaves /></ProtectedRoute>
            } />
            <Route path="/admin/complaints" element={
              <ProtectedRoute role="admin"><AdminComplaints /></ProtectedRoute>
            } />
            
            {/* --- Protected Routes for Both Roles --- */}
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />

            {/* --- Redirect Logic --- */}
            {/* The root path redirects to the correct dashboard */}
            <Route path="/" element={
              <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
            } />
            
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
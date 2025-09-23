// src/App.js
// This file is the root of your application, setting up routing and the global auth provider.

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './app/login/page';
import SignupPage from './app/signup/page';
import StudentDashboard from './app/student/dashboard/page';
import AdminDashboard from './app/admin/dashboard/page';
import ProfilePage from './app/profile/page';

// A layout component to decide where to redirect users upon login
function DashboardRedirect() {
  const { userProfile } = useAuth();
  if (!userProfile) return null; // Or a loading spinner

  // Redirect user based on their role
  return userProfile.role === 'admin' 
    ? <Navigate to="/admin/dashboard" /> 
    : <Navigate to="/student/dashboard" />;
}

function App() {
  return (
    // AuthProvider makes user data available to all components
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            {/* Student-only routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
            } />

            {/* Admin-only routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
            } />
            
            {/* Routes for both roles */}
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />

            {/* Redirects */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* 404 Not Found Fallback */}
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;


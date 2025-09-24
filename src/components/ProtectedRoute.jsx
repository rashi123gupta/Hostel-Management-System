// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component is now more robust and handles the loading state.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, userProfile, loading } = useAuth();

  // 1. Wait until the authentication state is fully loaded
  if (loading) {
    // While loading, you can show a loading spinner or just a blank page briefly.
    // Returning null is safe and prevents rendering children prematurely.
    return <div>Loading session...</div>;
  }

  // 2. If loading is finished and there's no user, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // 3. If it's an admin-only route, check the user's role
  if (adminOnly && userProfile?.role !== 'admin') {
    // If a non-admin tries to access, redirect them to their dashboard
    return <Navigate to="/student/dashboard" />;
  }

  // 4. If all checks pass, render the component
  return children;
}


// src/components/ProtectedRoute.jsx
// This component protects routes that require authentication and, optionally, a specific role.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading indicator while we check the auth state
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    // If user is not logged in, redirect them to the login page
    // We also save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && userProfile?.role !== role) {
    // If the route requires a specific role and the user doesn't have it,
    // redirect them to their default dashboard or an unauthorized page.
    return <Navigate to="/dashboard" replace />;
  }

  // If all checks pass, render the component the user was trying to access
  return children;
};

export default ProtectedRoute;

// src/components/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getDashboardPathByRole = (role) => {
  switch (role) {
    case "superuser":
      return "/superuser/dashboard";
    case "warden":
      return "/warden/dashboard";
    case "student":
      return "/student/dashboard";
    default:
      return "/login";
  }
};

export default function ProtectedRoute({ children, role }) {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  // 🔹 Show alert when userProfile is loaded and role mismatch is detected
  useEffect(() => {
    if (
      !loading &&
      currentUser &&
      userProfile?.role &&
      role &&
      userProfile.role !== role
    ) {
      alert("Unauthorized Access! Redirecting to your dashboard.");
    }
  }, [loading, currentUser, userProfile, role]);

  // 1️⃣ While checking authentication → loading screen
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          color: "#333",
        }}
      >
        Checking access...
      </div>
    );
  }

  // 2️⃣ Not logged in → redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3️⃣ Profile not yet loaded → wait
  if (!userProfile || !userProfile.role) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
        }}
      >
        Loading user profile...
      </div>
    );
  }

  // 4️⃣ Role mismatch → redirect after alert triggered above
  if (role && userProfile.role !== role) {
    const redirectPath = getDashboardPathByRole(userProfile.role);
    return <Navigate to={redirectPath} replace />;
  }

  // 5️⃣ Authorized → render child
  return children;
}

// src/context/AuthContext.jsx
// This context provides authentication state and user profile data to the entire app.

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { getUserProfile } from "../services/userService";

// 1. Create the context
const AuthContext = createContext();

// 2. Create a custom hook for easy consumption in any component
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Create the Provider component that will wrap our app
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial auth state check

  useEffect(() => {
    // onAuthStateChanged is the core Firebase listener for authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // User is signed in, fetch their profile from Firestore
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        // User is signed out
        setUserProfile(null);
      }
      
      // Auth check is complete, app can now render
      setLoading(false);
    });

    // Cleanup subscription on component unmount
    return unsubscribe;
  }, []);

  // The value object holds the data and functions we expose to the rest of the app
  const value = {
    currentUser, // The user object from Firebase Auth
    userProfile, // The user's profile document from Firestore (includes role)
    loading,     // The initial loading state
  };

  // Render children only when the initial auth check is done
  // This prevents UI flicker and rendering protected content to logged-out users
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


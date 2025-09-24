// src/context/AuthContext.jsx
import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '../services/userService';

// 1. Create the context
const AuthContext = React.createContext();

// 2. Create the custom hook for consuming the context
// This is what your components will use to get the auth state
export function useAuth() {
  return useContext(AuthContext);
}

// 3. Create the Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // If user is logged in, fetch their profile from Firestore
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        // If user is logged out, clear the profile
        setUserProfile(null);
      }
      // Set loading to false once we have the auth state and profile
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
  };

  // The Provider component makes the 'value' available to all children
  // We removed the "!loading &&" check here to simplify. The loading
  // check is now correctly handled inside App.js.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


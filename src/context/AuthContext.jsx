// src/context/AuthContext.jsx
import React, { useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      // Clear profile & stop old listener
      unsubscribeProfile();
      setUserProfile(null);

      if (user) {
        const docRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(
          docRef,
          async (docSnapshot) => {
            if (docSnapshot.exists()) {
              const profile = docSnapshot.data();
              if (profile.status === 'active') {
                setUserProfile({ id: docSnapshot.id, ...profile });
                setAuthError(null);
              } else {
                console.log("User inactive → sign out");
                setUserProfile(null);
                setAuthError('Your account has been disabled. Please contact warden.');
                await signOut(auth);
              }
            } else {
              console.log("Profile doc missing → sign out");
              setUserProfile(null);
              setAuthError('User profile not found.');
              await signOut(auth);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error listening to user profile:", error);
            setUserProfile(null);
            setAuthError('Error fetching user profile.');
            setLoading(false);
          }
        );
      } else {
        // user = null
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    authError,
    setAuthError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

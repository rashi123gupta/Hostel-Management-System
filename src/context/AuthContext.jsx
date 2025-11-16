// src/context/AuthContext.jsx
import React, { useContext, useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
// import { messagingPromise } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { onSnapshot, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [tokenSynced, setTokenSynced] = useState(false);
  const [unsubscribeProfile, setUnsubscribeProfile] = useState(null);

  // ✅ Helper function — safely logout (used internally)
  const safeSignOut = async () => {
    try {
      if (unsubscribeProfile) {
        unsubscribeProfile(); // stop Firestore listener BEFORE logout
      }
      await signOut(auth);
      console.log("✅ User signed out cleanly.");
    } catch (err) {
      console.warn("⚠️ Logout cleanup issue:", err.message);
    }
  };

  useEffect(() => {
    let unsubscribeAuth = () => {};

    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthError(null);

      // stop previous listener before setting new one
      if (unsubscribeProfile) unsubscribeProfile();
      setUserProfile(null);
      setTokenSynced(false);

      if (user) {
        const docRef = doc(db, "users", user.uid);
        let isMounted = true; // ✅ guard flag

        const unsub = onSnapshot(
          docRef,
          async (snapshot) => {
            if (!isMounted) return; // ✅ skip if unmounted or logout triggered

            try {
              if (!snapshot.exists()) {
                console.log("Profile missing → signing out");
                setAuthError("User profile not found.");
                await signOut(auth);
                return;
              }

              const profile = snapshot.data();

              if (profile.status !== "active") {
                console.log("Inactive user → sign out");
                setAuthError("Your account has been disabled.");
                await signOut(auth);
                return;
              }

              setUserProfile({ id: snapshot.id, ...profile });
              setAuthError(null);

              // if (profile.role === "student" && !tokenSynced) {
              //   try {
              //     setTokenSynced(true);

              //     const messaging = await messagingPromise;
              //     if (!messaging) return;

              //     const permission = await Notification.requestPermission();
              //     if (permission !== "granted") return;

              //     const vapidKey =
              //       "BBQ39RkS5fQc-prILv7_Bz5B6FS_dvRoSUvoOhq0Jc7RegtYSRFf1SWhY-I8iq7cjxi2gly0lUVK8D0Zuu56kQ8";
              //     const newToken = await getToken(messaging, { vapidKey });
              //     if (!newToken) return;

              //     const docSnap = await getDoc(docRef);
              //     const existingTokens =
              //       (docSnap.exists() ? docSnap.data().deviceTokens : []) || [];
              //     const uniqueTokens = Array.from(new Set(existingTokens));

              //     if (!uniqueTokens.includes(newToken)) {
              //       await updateDoc(docRef, { deviceTokens: [newToken] });
              //       console.log("✅ Token saved to Firestore");
              //     }
              //   } catch (err) {
              //     if (isMounted) console.error("FCM token error:", err);
              //   }
              // }

              if (isMounted) setLoading(false);
            } catch (err) {
              if (isMounted) console.error("Snapshot handler error:", err);
            }
          },
          (error) => {
            if (isMounted) {
              console.error("Profile listener error:", error);
              setAuthError("Error reading profile.");
              setLoading(false);
            }
          }
        );

        setUnsubscribeProfile(() => unsub);

        // ✅ Cleanup: runs before unmount or logout
        return () => {
          isMounted = false;
          unsub();
          console.log("🧹 Snapshot listener cleaned up safely");
        };
      }
      else {
        // user logged out
        if (unsubscribeProfile) unsubscribeProfile();
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    authError,
    setAuthError,
    safeSignOut, // ✅ exported for use in Navbar or logout button
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;

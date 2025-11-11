// src/context/AuthContext.jsx
import React, { useContext, useState, useEffect } from "react";
import { auth, db, messagingPromise } from "../services/firebase";
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
  const [tokenSynced, setTokenSynced] = useState(false); // ✅ new flag

  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthError(null);
      unsubscribeProfile(); // stop previous listener
      setUserProfile(null);
      setTokenSynced(false); // reset flag

      if (user) {
        const docRef = doc(db, "users", user.uid);

        unsubscribeProfile = onSnapshot(
          docRef,
          async (snapshot) => {
            if (!snapshot.exists()) {
              console.log("Profile missing → signing out");
              setAuthError("User profile not found.");
              await signOut(auth);
              setLoading(false);
              return;
            }

            const profile = snapshot.data();

            if (profile.status !== "active") {
              console.log("Inactive user → sign out");
              setAuthError("Your account has been disabled.");
              await signOut(auth);
              setUserProfile(null);
              setLoading(false);
              return;
            }

            setUserProfile({ id: snapshot.id, ...profile });
            setAuthError(null);

            // ✅ Register FCM token ONCE per login (not every snapshot)
            // ✅ Handle notifications only for STUDENTS
            if (profile.role === "student") {
              try {
                // Prevent duplicate execution per login
                if (window._fcmTokenProcessStarted) {
                  console.log("⏭️ Token setup already running, skipping duplicate call.");
                  return;
                }
                window._fcmTokenProcessStarted = true;

                const messaging = await messagingPromise;
                if (!messaging) return;

                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                  console.log("🔕 Notifications permission not granted.");
                  window._fcmTokenProcessStarted = false;
                  return;
                }

                const vapidKey =
                  "BBQ39RkS5fQc-prILv7_Bz5B6FS_dvRoSUvoOhq0Jc7RegtYSRFf1SWhY-I8iq7cjxi2gly0lUVK8D0Zuu56kQ8";

                const newToken = await getToken(messaging, { vapidKey });

                if (!newToken) {
                  console.warn("⚠️ No FCM token returned.");
                  window._fcmTokenProcessStarted = false;
                  return;
                }

                console.log("✅ FCM Token:", newToken);

                const docSnap = await getDoc(docRef);
                const existingTokens = (docSnap.exists() ? docSnap.data().deviceTokens : []) || [];

                // Deduplicate existing list
                const uniqueTokens = Array.from(new Set(existingTokens));

                // Skip if already saved
                if (uniqueTokens.includes(newToken)) {
                  console.log("ℹ️ Token already exists — no update needed.");
                  window._fcmTokenProcessStarted = false;
                  return;
                }

                // Replace all previous tokens with current one (1 token per browser)
                console.log("🔄 Saving new token to Firestore.");
                await updateDoc(docRef, { deviceTokens: [newToken] });

                console.log("✅ Token successfully saved.");
              } catch (err) {
                console.error("FCM token error:", err);
              } finally {
                // Allow future re-runs only after a logout/login
                window._fcmTokenProcessStarted = false;
              }
            }

            setLoading(false);
          },
          (error) => {
            console.error("Profile listener error:", error);
            setAuthError("Error reading profile.");
            setLoading(false);
          }
        );
      } else {
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

export default AuthContext;

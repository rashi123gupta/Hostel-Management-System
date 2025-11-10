// src/context/AuthContext.jsx
import React, { useContext, useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { onSnapshot, doc } from "firebase/firestore";
import { messagingPromise } from "../services/firebase";
import { getToken } from "firebase/messaging";
import { updateDoc, arrayUnion } from "firebase/firestore";

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

      // Clear old profile listener
      unsubscribeProfile();
      setUserProfile(null);

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

            // Check active/inactive
            if (profile.status !== "active") {
              console.log("Inactive user → sign out");
              setAuthError("Your account has been disabled.");
              await signOut(auth);
              setUserProfile(null);
              setLoading(false);
              return;
            }

            // ✅ Profile OK — save it
            setUserProfile({
              id: snapshot.id,
              ...profile,
            });
            setAuthError(null);

            // ✅ Handle notifications only for STUDENTS
            if (profile.role === "student") {
              try {
                const messaging = await messagingPromise;
                if (messaging) {
                  const permission = await Notification.requestPermission();

                  if (permission === "granted") {
                    const vapidKey =
                      "BBQ39RkS5fQc-prILv7_Bz5B6FS_dvRoSUvoOhq0Jc7RegtYSRFf1SWhY-I8iq7cjxi2gly0lUVK8D0Zuu56kQ8";

                    const token = await getToken(messaging, { vapidKey });

                    if (token) {
                      console.log("✅ FCM Token:", token);

                      const existingTokens =
                        snapshot.data().deviceTokens || [];

                      // ✅ Save token ONLY if it's new
                      if (!existingTokens.includes(token)) {
                        console.log("✅ Saving NEW token to Firestore");
                        await updateDoc(docRef, {
                          deviceTokens: arrayUnion(token),
                        });
                      } else {
                        console.log("ℹ️ Token already exists, not saving");
                      }
                    }
                  }
                }
              } catch (err) {
                console.error("FCM token error:", err);
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
        // User logged out
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

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { getUserProfile } from './userService'; 

/**
 * Signs up a new user...
 */
export const signUp = async (email, password, additionalData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create the user's profile document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      ...additionalData,         // name, rollNo, hostelNo, roomNo
      email: user.email,
      role: "student",          
      createdAt: new Date(),
      status: "active" 
    });

    return { success: true, user };
  } catch (error) {
    // Provide a more user-friendly error message
    const errorMessage = error.message.includes('auth/email-already-in-use')
      ? 'This email address is already in use.'
      : 'Failed to create account. Please try again.';
    console.error("Signup Error:", error.message);
    return { success: false, error: errorMessage };
  }
};

/**
 * Logs in a user AND checks their authorization.
 */
export const logIn = async (email, password) => {
  try {
    // --- MODIFICATION: This function will NOW ONLY log in. ---
    // It will NOT check for status. The AuthContext will handle that.
    // This solves the "Missing or insufficient permissions" race condition.
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };

  } catch (error) {
    // Re-throw the error so the LoginPage can catch it
    console.error("Login Error:", error.message);
    throw error; 
  }
};

/**
 * Logs out the currently authenticated user.
 */
export const logOut = () => {
  return signOut(auth);
};
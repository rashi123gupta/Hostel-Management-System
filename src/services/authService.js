import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Signs up a new user with email, password, and additional profile data.
 * This function now correctly adds the 'role' and 'createdAt' fields.
 */
export const signUp = async (email, password, additionalData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create the user's profile document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      ...additionalData,         // name, rollNo, hostelNo, roomNo
      email: user.email,
      role: "student",          // <-- FIXED: Default role is now added
      createdAt: new Date(),    // <-- FIXED: Creation timestamp is now added
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
 * Logs in a user with their email and password.
 */
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    const errorMessage = 'Invalid email or password. Please try again.';
    console.error("Login Error:", error.message);
    return { success: false, error: errorMessage };
  }
};

/**
 * Logs out the currently authenticated user.
 */
export const logOut = () => {
  return signOut(auth);
};


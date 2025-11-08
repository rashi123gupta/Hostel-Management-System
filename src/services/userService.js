import { db, functions, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

const CREATE_USER_URL = "https://us-central1-hostel-management-system-fde00.cloudfunctions.net/createNewUser";

/**
 * Calls our Cloud Function to create a new user by manually passing the auth token.
 * @param {object} userData - Data for the new user (email, password, name, roleToCreate, etc.)
 */
export const createNewUser = async (userData) => {
  
  // 1. Get the currently logged-in user from our 'auth' instance
  const user = auth.currentUser;
  
  if (!user) {
    // This should not happen if our ProtectedRoute is working, but it's a good safeguard.
    throw new Error("No user is logged in.");
  }

  // 2. Manually get the user's ID Token (their "credentials")
  const idToken = await user.getIdToken();

  // 3. Get our callable function (this syntax is correct)
  const createUser = httpsCallable(functions, 'createNewUser'); 
  
  try {
    // 4. Pass BOTH the user data AND the token
    const result = await createUser({ 
      userData: userData,  // The data for the new user
      idToken: idToken     // The token of the user *making* the request
    });
    
    return result.data;
  } catch (error) {
    console.error("Error calling createNewUser function:", error);
    throw new Error(error.message);
  }
};

/**
 * Fetches a user's profile from Firestore.
 * @param {string} userId - The UID of the user.
 * @returns {object} The user's profile data.
 */
export const getUserProfile = async (userId) => {
  if (!userId) return null;
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};

/**
 * Updates a user's profile in Firestore.
 * @param {string} userId - The UID of the user to update.
 *... (This function remains the same as before) ...
 */
export const updateUserProfile = async (userId, dataToUpdate) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, dataToUpdate);
};

/**
 * Retrieves all user profiles from the 'users' collection.
 * This is an admin-only function.
 * @returns {Promise<Array<object>>} - An array of all user objects.
 */
export const getAllUsers = async () => {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return userList;
};


import { db, functions, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

const CREATE_USER_URL = "https://us-central1-hostel-management-system-fde00.cloudfunctions.net/createNewUser";

/**
 * Calls our HTTP Cloud Function to create a new user using fetch.
 * @param {object} userData - Data for the new user (email, password, name, etc.)
 */
export const createNewUser = async (userData) => {
  
  // 1. PASTE YOUR FUNCTION URL HERE
  const functionUrl = "https://us-central1-hostel-management-system-fde00.cloudfunctions.net/createNewUser";

  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is logged in.");
  }

  // 2. Get the ID Token
  const idToken = await user.getIdToken();

  try {
    // 3. Use standard 'fetch'
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 4. Manually set the Authorization header
        'Authorization': `Bearer ${idToken}` 
      },
      // 5. Wrap the payload in a 'data' object to match
      //    the 'onCall' format our function still expects.
      body: JSON.stringify({ data: userData }) 
    });

    if (!response.ok) {
      // If the server response is not 200-299, throw an error
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create user.");
    }

    const result = await response.json();
    // Our function sends back { data: { success: true, ... } }
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

/**
 * Fetches all users that match a specific role.
 * @param {string} role - The role to filter by (e.g., 'student', 'warden').
 * @returns {Promise<Array<object>>} - An array of user objects.
 */
export const getUsersByRole = async (role) => {
  const usersCollection = collection(db, 'users');
  const q = query(usersCollection, where('role', '==', role));
  const userSnapshot = await getDocs(q);
  const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return userList;
};

/**
 * Updates the 'status' field of a user document (for soft delete).
 * @param {string} userId - The UID of the user to update.
 * @param {string} newStatus - The new status ('active' or 'inactive').
 */
export const updateUserStatus = async (userId, newStatus) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    status: newStatus
  });
};
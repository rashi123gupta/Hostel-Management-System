import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

/**
 * Creates a new user profile document in Firestore.
 * This is typically called right after a user signs up.
 * @param {string} userId - The Firebase Authentication UID of the user.
 * @param {object} userData - The user's profile data (name, email, role, etc.).
 */
export const createUserProfile = async (userId, userData) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, userData);
};

/**
 * Retrieves a specific user's profile from Firestore.
 * @param {string} userId - The UID of the user to fetch.
 * @returns {Promise<object|null>} - The user's profile data or null if not found.
 */
export const getUserProfile = async (userId) => {
  if (!userId) return null;
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * Updates an existing user's profile in Firestore.
 * @param {string} userId - The UID of the user to update.
 * @param {object} dataToUpdate - An object containing the fields to update.
 */
export const updateUserProfile = async (userId, dataToUpdate) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, dataToUpdate);
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


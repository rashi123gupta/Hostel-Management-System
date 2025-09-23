// src/services/userService.js
// This file handles all Firestore operations related to the 'users' collection.

import { doc, getDoc, setDoc, updateDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Creates a new user profile document in Firestore.
 * This is called right after a successful signup.
 * @param {string} userId - The UID from Firebase Auth.
 * @param {object} data - The user's profile data (email, name, etc.).
 * @returns {Promise<void>}
 */
export const createUserProfile = (userId, data) => {
  const userDocRef = doc(db, "users", userId);
  return setDoc(userDocRef, {
    ...data,
    role: "student", // Default role for all new signups
    createdAt: serverTimestamp()
  });
};

/**
 * Retrieves a user's profile from Firestore.
 * @param {string} userId - The UID of the user.
 * @returns {Promise<object|null>} The user's profile data or null if not found.
 */
export const getUserProfile = async (userId) => {
  const userDocRef = doc(db, "users", userId);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return { id: userDocSnap.id, ...userDocSnap.data() };
  } else {
    console.error("No such user profile!");
    return null;
  }
};

/**
 * Updates a user's profile data in Firestore.
 * @param {string} userId - The UID of the user to update.
 * @param {object} data - An object containing the fields to update.
 * @returns {Promise<void>}
 */
export const updateUserProfile = (userId, data) => {
  const userDocRef = doc(db, "users", userId);
  return updateDoc(userDocRef, data);
};


/**
 * (Admin) Fetches all user profiles from Firestore.
 * @returns {Promise<Array>} An array of all user documents.
 */
export const getAllUsers = async () => {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


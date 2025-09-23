// src/services/authService.js
// This file contains all functions related to Firebase Authentication.

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile } from "./userService";

/**
 * Signs up a new user with email and password and creates their profile in Firestore.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {object} additionalData - Additional profile data (e.g., { name, rollNo }).
 * @returns {Promise<UserCredential>} The user credential object on successful signup.
 */
export const signUp = async (email, password, additionalData) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // After creating the user in Auth, create their profile document in Firestore
  await createUserProfile(user.uid, {
    email,
    ...additionalData, // Spreads fields like name, rollNo, hostelNo, etc.
  });

  return userCredential;
};

/**
 * Logs in a user with their email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<UserCredential>} The user credential object on successful login.
 */
export const logIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Logs out the currently authenticated user.
 * @returns {Promise<void>}
 */
export const logOut = () => {
  return signOut(auth);
};


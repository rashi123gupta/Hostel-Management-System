import { 
  db, 
  auth 
} from './firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Sets up a real-time listener for the weekly mess menu,
 * ordered by dayIndex (1=Monday, 7=Sunday).
 * @param {function} callback - The function to call with the updated menu list.
 * @param {function} onError - The function to call if an error occurs.
 * @returns {function} - The unsubscribe function for the listener.
 */
export const onMessMenuChange = (callback, onError) => {
  const q = query(collection(db, "messMenu"), orderBy("dayIndex", "asc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const menuList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(menuList);
  }, 
  (error) => {
    console.error("Error in messMenu listener: ", error);
    onError(error);
  });

  return unsubscribe;
};

/**
 * Sets up a real-time listener for all student mess suggestions,
 * ordered by submission date (newest first).
 * @param {function} callback - The function to call with the updated suggestions list.
 * @param {function} onError - The function to call if an error occurs.
 * @returns {function} - The unsubscribe function for the listener.
 */
export const onMessSuggestionsChange = (callback, onError) => {
  const q = query(collection(db, "messSuggestions"), orderBy("submittedAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const suggestionsList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(suggestionsList);
  }, 
  (error) => {
    console.error("Error in messSuggestions listener: ", error);
    onError(error);
  });

  return unsubscribe;
};

/**
 * Adds a new mess menu suggestion to the 'messSuggestions' collection.
 * @param {object} suggestionData - The data from the form (breakfast, lunch, etc.).
 * @param {object} userProfile - The profile of the logged-in student.
 */
export const addMessSuggestion = async (suggestionData, userProfile) => {
  if (!userProfile) {
    throw new Error("No user profile found. Cannot submit suggestion.");
  }

  try {
    await addDoc(collection(db, "messSuggestions"), {
      ...suggestionData, // breakfast, lunch, snacks, dinner
      studentId: userProfile.id,
      studentName: userProfile.name,
      rollNo: userProfile.rollNo,
      status: "Pending", // Default status
      submittedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding mess suggestion: ", error);
    throw new Error("Could not submit suggestion.");
  }
};
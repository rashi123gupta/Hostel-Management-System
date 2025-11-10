import { collection, addDoc, serverTimestamp, query, where, onSnapshot,orderBy } 
from 'firebase/firestore';
import { db, auth } from './firebase';

/**
 * Adds a new mess feedback document.
 */
export const addMessFeedback = async (feedbackData) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is logged in.");
  }
  
  // Use the full userProfile data passed from the modal
  await addDoc(collection(db, 'messFeedback'), {
    ...feedbackData, // contains rating, suggestions, studentName, rollNo
    studentId: user.uid,
    createdAt: serverTimestamp(),
  });
};

/**
 * Sets up a real-time listener for a student's mess feedback,
 * ordered by creation date.
 */
export const onStudentFeedbackChange = (studentId, callback, onError) => {
  if (!studentId) {
    console.error("Student ID is required.");
    return () => {}; 
  }

  const q = query(
    collection(db, 'messFeedback'), 
    where('studentId', '==', studentId),
    orderBy('createdAt', 'desc') // Order by most recent first
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const feedbackList = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // "Null-safe" sort to prevent crashes
    const sortedList = feedbackList.sort((a, b) => {
      const aDate = a.createdAt ? a.createdAt.toDate() : new Date(0);
      const bDate = b.createdAt ? b.createdAt.toDate() : new Date(0);
      return bDate - aDate; // Sort descending
    });
    
    callback(sortedList); 
    
  }, (error) => {
    console.error("Error in mess feedback listener: ", error);
    onError(error); 
  });

  return unsubscribe;
};

/**
 * Sets up a real-time listener for ALL mess feedback,
 * sorted by creation date (newest first), then by studentId.
 * @param {function} callback - The function to call with the updated list.
 * @param {function} onError - The function to call if an error occurs.
 * @returns {function} - The unsubscribe function for the listener.
 */
export const onAllFeedbackChange = (callback, onError) => {
  // Query to get all feedback, sorted by date, then student ID
  const q = query(
    collection(db, 'messFeedback'),
    orderBy('createdAt', 'desc'),
    orderBy('studentId', 'asc') 
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const feedbackList = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // No local sort needed, Firestore is handling the complex sort.
    callback(feedbackList); 
    
  }, (error) => {
    console.error("Error in all feedback listener: ", error);
    onError(error); // Pass the error to the component
  });

  return unsubscribe;
};
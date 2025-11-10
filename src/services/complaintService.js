import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, onSnapshot,orderBy } 
from 'firebase/firestore'; 
import { db, auth } from './firebase';

/**
 * Adds a new complaint for the currently logged-in student.
 */
export const addComplaint = async (description) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is logged in to add a complaint.");
  }

  await addDoc(collection(db, 'complaints'), {
    studentId: user.uid,
    description,
    status: 'Pending',
    createdAt: serverTimestamp(),
    resolutionDetails: '-',
  });
};

/**
 * Fetches all complaints for a specific student one time.
 */
export const getStudentComplaints = async (studentId) => {
  if (!studentId) {
    console.error("Student ID is required to fetch complaints.");
    return [];
  }
  const q = query(collection(db, 'complaints'), where('studentId', '==', studentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- NEW/UPDATED REAL-TIME LISTENER FUNCTION ---
/**
 * Sets up a real-time listener for a student's complaints, sorted by date.
 * @param {string} studentId - The UID of the student.
 * @param {function} callback - The function to call with the updated complaints list.
 * @param {function} onError - The function to call if an error occurs.
 * @returns {function} - The unsubscribe function for the listener.
 */
export const onStudentComplaintsChange = (studentId, callback, onError) => {
  if (!studentId) {
    console.error("Student ID is required to set up listener.");
    return () => {}; // Return an empty unsubscribe function
  }

  // Added orderBy('createdAt', 'desc') 
  const q = query(
    collection(db, 'complaints'), 
    where('studentId', '==', studentId),
    orderBy('createdAt', 'desc') // Order by most recent first
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const complaints = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // "Null-safe" sort to prevent crashes if 'createdAt' is temporarily null
    const sortedComplaints = complaints.sort((a, b) => {
      const aDate = a.createdAt ? a.createdAt.toDate() : new Date(0);
      const bDate = b.createdAt ? b.createdAt.toDate() : new Date(0);
      return bDate - aDate; // Sort descending
    });

    callback(sortedComplaints); // Send the new, sorted list to our component

  }, (error) => {
    // This will pass the permissions error up to the component
    console.error("Error in complaint listener: ", error);
    onError(error);
  });

  return unsubscribe;
};

/**
 * Fetches all complaints from all students (for admin).
 */
export const getAllComplaints = async () => {
  const querySnapshot = await getDocs(collection(db, 'complaints'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Updates the status and resolution details of a complaint (for admin).
 */
export const updateComplaintStatus = async (complaintId, status, resolutionDetails) => {
  const complaintDocRef = doc(db, 'complaints', complaintId);
  await updateDoc(complaintDocRef, {
    status,
    resolutionDetails: resolutionDetails || '-',
    updatedAt: serverTimestamp(),
  });
};
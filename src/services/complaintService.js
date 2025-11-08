// src/services/complaintService.js
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

/**
 * Adds a new complaint to the 'complaints' collection.
 * @param {string} studentId - The UID of the student filing the complaint.
 * @param {object} complaintData - The complaint data ({ description }).
 * @returns {Promise<void>}
 */
export const addComplaint = async (studentId, complaintData) => {
  try {
    await addDoc(collection(db, 'complaints'), {
      studentId: studentId,
      description: complaintData.description,
      status: 'Pending', // Default status
      createdAt: serverTimestamp(),
      resolutionDetails: '-', // Default resolution details
    });
  } catch (error) {
    console.error("Error adding complaint: ", error);
    throw new Error("Could not submit complaint.");
  }
};

/**
 * Fetches all complaints for a specific student.
 * @param {string} studentId - The UID of the student.
 * @returns {Array} An array of complaint documents.
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

/**
 * Fetches all complaints from all students. (Admin only)
 * @returns {Promise<Array<object>>} - An array of all complaint documents.
 */
export const getAllComplaints = async () => {
    const querySnapshot = await getDocs(collection(db, 'complaints'));
    const complaints = [];
    querySnapshot.forEach((doc) => {
        complaints.push({ id: doc.id, ...doc.data() });
    });
    return complaints;
};

/**
 * Updates the status and resolution details of a complaint. (Admin only)
 * @param {string} complaintId - The ID of the complaint document.
 * @param {string} newStatus - The new status ('Pending' or 'Resolved').
 * @param {string} resolutionDetails - The remarks from the admin.
 * @returns {Promise<void>}
 */
export const updateComplaintStatus = async (complaintId, newStatus, resolutionDetails) => {
    const complaintRef = doc(db, 'complaints', complaintId);
    await updateDoc(complaintRef, {
        status: newStatus,
        resolutionDetails: resolutionDetails || '-', // Ensure it's not undefined
        updatedAt: serverTimestamp(),
    });
};

/**
 * Sets up a real-time listener for a student's complaints.
 * @param {string} studentId - The UID of the student.
 * @param {function} callback - The function to call with the updated complaints list.
 * @returns {function} - The unsubscribe function for the listener.
 */
export const onStudentComplaintsChange = (studentId, callback) => {
  if (!studentId) {
    console.error("Student ID is required to set up listener.");
    return () => {}; // Return an empty unsubscribe function
  }

  const q = query(collection(db, 'complaints'), where('studentId', '==', studentId));
  
  // onSnapshot returns an unsubscribe function
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const complaints = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(complaints); // Send the new list to our component
  }, (error) => {
    console.error("Error in complaint listener: ", error);
  });

  return unsubscribe;
};

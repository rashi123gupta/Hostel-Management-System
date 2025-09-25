// src/services/complaintService.js
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

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
 * Fetches all complaints for a specific student, ordered by creation date.
 * @param {string} studentId - The UID of the student.
 * @returns {Promise<Array>} - An array of complaint documents.
 */
export const getStudentComplaints = async (studentId) => {
  try {
    const q = query(
      collection(db, 'complaints'), 
      where('studentId', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    // Sort by date in descending order on the client-side
    const complaints = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    complaints.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    return complaints;
  } catch (error) {
    console.error("Error fetching student complaints: ", error);
    throw new Error("Could not fetch complaint history.");
  }
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

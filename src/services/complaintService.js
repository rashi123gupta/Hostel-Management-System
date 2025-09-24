// src/services/complaintService.js
// Handles all Firestore operations for the 'complaints' collection.

import { collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

const complaintsCollection = collection(db, "complaints");

/**
 * Adds a new complaint from a student.
 * @param {object} complaintData - { studentId, details, category }
 * @returns {Promise<DocumentReference>}
 */
export const addComplaint = (complaintData) => {
  return addDoc(complaintsCollection, {
    ...complaintData,
    status: "Pending", // Always pending on creation
    createdAt: serverTimestamp()
  });
};

/**
 * Fetches all complaints submitted by a specific student.
 * @param {string} studentId - The UID of the student.
 * @returns {Promise<Array>} An array of complaint documents.
 */
export const getStudentComplaints = async (studentId) => {
  const q = query(complaintsCollection, where("studentId", "==", studentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * (Admin) Fetches all complaints from all students.
 * @returns {Promise<Array>} An array of all complaint documents.
 */
export const getAllComplaints = async () => {
    const querySnapshot = await getDocs(complaintsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * (Admin) Updates the status and details of a complaint.
 * @param {string} complaintId - The document ID of the complaint.
 * @param {string} status - The new status ("Resolved").
 * @param {string} [resolutionDetails] - Optional resolution details from the admin.
 * @returns {Promise<void>}
 */
export const updateComplaintStatus = (complaintId, status, resolutionDetails = "") => {
    const complaintDocRef = doc(db, "complaints", complaintId);
    return updateDoc(complaintDocRef, {
        status,
        resolutionDetails,
        updatedAt: serverTimestamp()
    });
};


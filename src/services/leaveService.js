// src/services/leaveService.js
// Handles all Firestore operations for the 'leaves' collection.

import { collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

const leavesCollection = collection(db, "leaves");

/**
 * Adds a new leave request for a student.
 * @param {object} leaveData - { studentId, fromDate, toDate, reason }
 * @returns {Promise<DocumentReference>}
 */
export const addLeave = (leaveData) => {
  return addDoc(leavesCollection, {
    ...leaveData,
    status: "Pending", // Always pending on creation
    appliedAt: serverTimestamp()
  });
};

/**
 * Fetches all leave requests submitted by a specific student.
 * @param {string} studentId - The UID of the student.
 * @returns {Promise<Array>} An array of leave documents.
 */
export const getStudentLeaves = async (studentId) => {
  const q = query(leavesCollection, where("studentId", "==", studentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * (Admin) Fetches all leave requests from all students.
 * @returns {Promise<Array>} An array of all leave documents.
 */
export const getAllLeaves = async () => {
    const querySnapshot = await getDocs(leavesCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * (Admin) Updates the status and remarks of a leave request.
 * @param {string} leaveId - The document ID of the leave request.
 * @param {string} status - The new status ("Approved" or "Rejected").
 * @param {string} [adminRemarks] - Optional remarks from the admin.
 * @returns {Promise<void>}
 */
export const updateLeaveStatus = (leaveId, status, adminRemarks = "") => {
    const leaveDocRef = doc(db, "leaves", leaveId);
    return updateDoc(leaveDocRef, {
        status,
        adminRemarks,
        updatedAt: serverTimestamp()
    });
};


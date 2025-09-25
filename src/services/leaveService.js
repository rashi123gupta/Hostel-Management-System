// src/services/leaveService.js
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Helper function to format a Date object or a date string into DD-MM-YYYY format.
 * @param {Date | string} date - The date to format.
 * @returns {string} - The formatted date string.
 */
const formatDateToDDMMYYYY = (date) => {
  const d = new Date(date);
  let day = d.getDate();
  let month = d.getMonth() + 1; // Month is 0-indexed
  const year = d.getFullYear();

  if (day < 10) day = '0' + day;
  if (month < 10) month = '0' + month;

  return `${day}-${month}-${year}`;
};


/**
 * Adds a new leave request to the 'leaves' collection using the specified format.
 * @param {string} studentId - The UID of the student applying for leave.
 * @param {object} leaveData - The leave data ({ fromDate, toDate, reason }).
 * @returns {Promise<void>}
 */
export const addLeave = async (studentId, leaveData) => {
  try {
    await addDoc(collection(db, 'leaves'), {
      studentId: studentId,
      // Format dates to DD-MM-YYYY strings before saving
      fromDate: formatDateToDDMMYYYY(leaveData.fromDate),
      toDate: formatDateToDDMMYYYY(leaveData.toDate),
      reason: leaveData.reason,
      status: 'Pending', 
      appliedAt: serverTimestamp(),
      adminRemarks: '-', // Set initial admin remarks
    });
  } catch (error) {
    console.error("Error adding leave request: ", error);
    throw new Error("Could not submit leave request.");
  }
};

/**
 * Fetches all leave requests for a specific student.
 * @param {string} studentId - The UID of the student.
 * @returns {Promise<Array>} - An array of leave documents.
 */
export const getStudentLeaves = async (studentId) => {
  try {
    const q = query(collection(db, 'leaves'), where('studentId', '==', studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching student leaves: ", error);
    throw new Error("Could not fetch leave history.");
  }
};

/**
 * Fetches all leave requests from all students. (Admin only)
 */
export const getAllLeaves = async () => {
    const querySnapshot = await getDocs(collection(db, 'leaves'));
    const leaves = [];
    querySnapshot.forEach((doc) => {
        leaves.push({ id: doc.id, ...doc.data() });
    });
    return leaves;
};

/**
 * Updates the status and remarks of a specific leave request. (Admin only)
 * @param {string} leaveId - The ID of the leave document to update.
 * @param {string} newStatus - The new status ('Approved' or 'Rejected').
 * @param {string} adminRemarks - The remarks from the admin.
 */
export const updateLeaveStatus = async (leaveId, newStatus, adminRemarks) => {
    const leaveRef = doc(db, 'leaves', leaveId);
    await updateDoc(leaveRef, {
        status: newStatus,
        adminRemarks: adminRemarks || '-', // Ensure it's not undefined
        updatedAt: serverTimestamp(),
    });
};

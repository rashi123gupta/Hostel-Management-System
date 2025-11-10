// src/services/leaveService.js
import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  serverTimestamp,
  orderBy,   // --- NEW: Import orderBy ---
  onSnapshot // --- NEW: Import onSnapshot ---
} from 'firebase/firestore';

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
 * @param {object} leaveData - The leave data ({ fromDate, toDate, reason }).
 * @returns {Promise<void>}
 */
export const addLeave = async (leaveData) => {
  // --- MODIFICATION: Get user from auth service ---
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is logged in to request leave.");
  }

  try {
    await addDoc(collection(db, 'leaves'), {
      studentId: user.uid,
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
 * [DEPRECATED] Fetches all leave requests for a specific student one time.
 * We are replacing this with the real-time listener below.
 * @param {string} studentId - The UID of the student.
 * @returns {Array} An array of leave documents.
 */
export const getStudentLeaves = async (studentId) => {
  if (!studentId) {
    console.error("Student ID is required to fetch leaves.");
    return [];
  }
  const q = query(collection(db, 'leaves'), where('studentId', '==', studentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- NEW REAL-TIME LISTENER FUNCTION ---
/**
 * Sets up a real-time listener for a student's leaves, sorted by date.
 * @param {string} studentId - The UID of the student.
 * @param {function} callback - The function to call with the updated list.
 * @param {function} onError - The function to call if an error occurs.
 * @returns {function} - The unsubscribe function for the listener.
 */
export const onStudentLeavesChange = (studentId, callback, onError) => {
  if (!studentId) {
    console.error("Student ID is required.");
    return () => {}; // Return an empty unsubscribe function
  }

  // Query to get leaves for the student, ordered by 'appliedAt' descending
  const q = query(
    collection(db, 'leaves'), 
    where('studentId', '==', studentId),
    orderBy('appliedAt', 'desc') // Order by most recent first
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const leaves = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // "Null-safe" sort to prevent crashes if 'appliedAt' is temporarily null
    const sortedLeaves = leaves.sort((a, b) => {
      const aDate = a.appliedAt ? a.appliedAt.toDate() : new Date(0);
      const bDate = b.appliedAt ? b.appliedAt.toDate() : new Date(0);
      return bDate - aDate; // Sort descending
    });
    
    callback(sortedLeaves); // Send the sorted list to the component
    
  }, (error) => {
    console.error("Error in student leaves listener: ", error);
    onError(error); // Pass the error to the component
  });

  return unsubscribe;
};
// --- END OF NEW FUNCTION ---

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
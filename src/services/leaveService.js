import { 
  db, 
  auth 
} from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  serverTimestamp,
  orderBy,   
  onSnapshot 
} from 'firebase/firestore';

// Helper function to format a Date object
const formatDateToDDMMYYYY = (date) => {
// ... (existing code is correct) ...
  const d = new Date(date);
  let day = d.getDate();
  let month = d.getMonth() + 1; 
  const year = d.getFullYear();

  if (day < 10) day = '0' + day;
  if (month < 10) month = '0' + month;

  return `${day}-${month}-${year}`;
};


// Function for students to add a leave
export const addLeave = async (leaveData) => {
// ... (existing code is correct) ...
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is logged in to request leave.");
  }

  try {
    await addDoc(collection(db, 'leaves'), {
      studentId: user.uid,
      fromDate: formatDateToDDMMYYYY(leaveData.fromDate),
      toDate: formatDateToDDMMYYYY(leaveData.toDate),
      reason: leaveData.reason || '-', 
      status: 'Pending', 
      appliedAt: serverTimestamp(),
      adminRemarks: '-', 
    });
  } catch (error) {
    console.error("Error adding leave request: ", error);
    throw new Error("Could not submit leave request.");
  }
};

// [DEPRECATED] One-time fetch for students
export const getStudentLeaves = async (studentId) => {
// ... (existing code is correct) ...
  const q = query(collection(db, 'leaves'), where('studentId', '==', studentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Real-time listener for students
export const onStudentLeavesChange = (studentId, callback, onError) => {
// ... (existing code is correct) ...
  if (!studentId) {
    console.error("Student ID is required.");
    return () => {}; 
  }
  const q = query(
    collection(db, 'leaves'), 
    where('studentId', '==', studentId),
    orderBy('appliedAt', 'desc') 
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
// ... (existing code is correct) ...
    const leaves = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const sortedLeaves = leaves.sort((a, b) => {
      const aDate = a.appliedAt ? a.appliedAt.toDate() : new Date(0);
      const bDate = b.appliedAt ? b.appliedAt.toDate() : new Date(0);
      return bDate - aDate;
    });
    callback(sortedLeaves); 
  }, (error) => {
    console.error("Error in student leaves listener: ", error);
    onError(error); 
  });

  return unsubscribe;
};

// [DEPRECATED] One-time fetch for wardens
export const getAllLeaves = async () => {
// ... (existing code is correct) ...
    const querySnapshot = await getDocs(collection(db, 'leaves'));
    const leaves = [];
    querySnapshot.forEach((doc) => {
        leaves.push({ id: doc.id, ...doc.data() });
    });
    return leaves;
};

// --- NEW REAL-TIME LISTENER FOR WARDEN ---
/**
 * Sets up a real-time listener for ALL leaves, for the warden's page.
 * @param {function} callback - The function to call with the updated list.
 * @param {function} onError - The function to call if an error occurs.
 * @returns {function} - The unsubscribe function for the listener.
 */
export const onAllLeavesChange = (callback, onError) => {
  // Query to get all leaves, ordered by 'appliedAt' descending
  const q = query(
    collection(db, 'leaves'),
    orderBy('appliedAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const leaves = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // "Null-safe" sort just in case
    const sortedLeaves = leaves.sort((a, b) => {
      const aDate = a.appliedAt ? a.appliedAt.toDate() : new Date(0);
      const bDate = b.appliedAt ? b.appliedAt.toDate() : new Date(0);
      return bDate - aDate;
    });

    callback(sortedLeaves); // Send the sorted list to the component
    
  }, (error) => {
    console.error("Error in all leaves listener: ", error);
    onError(error); // Pass the error to the component
  });

  return unsubscribe;
};
// --- END OF NEW FUNCTION ---


// Function for wardens to update a leave
export const updateLeaveStatus = async (leaveId, newStatus, adminRemarks) => {
// ... (existing code is correct) ...
    const leaveRef = doc(db, 'leaves', leaveId);
    await updateDoc(leaveRef, {
        status: newStatus,
        adminRemarks: adminRemarks || '-',
        updatedAt: serverTimestamp(),
    });
};
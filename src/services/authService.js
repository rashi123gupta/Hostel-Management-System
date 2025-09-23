// import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// import app from "./firebase";

// const auth = getAuth(app);

// export const loginWithEmailAndPassword = async (email, password) => {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;
//     return { success: true, user };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// };

export const loginWithEmailAndPassword = async (email, password) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const dummyStudentEmail = 'student@test.com';
  const dummyPassword = 'password';

  if (email === dummyStudentEmail && password === dummyPassword) {
    const dummyUser = {
      uid: 'dummy-student-id',
      email: dummyStudentEmail,
      role: 'student'
    };
    return { success: true, user: dummyUser };
  } else {
    return { success: false, error: 'Invalid email or password.' };
  }
};

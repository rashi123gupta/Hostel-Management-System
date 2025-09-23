// Import the functions you need from the SDKs you need
//import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4xxnv2F1z--V5gVuML_hbijDaTYv0y5k",
  authDomain: "hostel-management-system-fde00.firebaseapp.com",
  projectId: "hostel-management-system-fde00",
  storageBucket: "hostel-management-system-fde00.firebasestorage.app",
  messagingSenderId: "990603426370",
  appId: "1:990603426370:web:99dfcc021a4d9548a00bdb",
  measurementId: "G-62QTZQSJZD"
};

//const analytics = getAnalytics(app);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services to be used throughout the app
export const auth = getAuth(app);
export const db = getFirestore(app);
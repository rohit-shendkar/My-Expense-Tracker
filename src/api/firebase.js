// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3JBUM08WT-Obc88y8zNXImbVkTPh7b6I",
  authDomain: "myexpensetracker-e10ea.firebaseapp.com",
  projectId: "myexpensetracker-e10ea",
  storageBucket: "myexpensetracker-e10ea.firebasestorage.app",
  messagingSenderId: "880898055552",
  appId: "1:880898055552:web:c23e2ab15bbcc479817565",
  measurementId: "G-P7H3FYE6RL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
export const appId = firebaseConfig.appId

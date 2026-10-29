import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// This web config is public by design. Your data is protected by the Firestore rules
// (firestore.rules), which only allow your own login.
const firebaseConfig = {
  apiKey: "AIzaSyBIeibTKI52fXqWLWhJsJLlEbOgnxXW9II",
  authDomain: "keepsake-1709b.firebaseapp.com",
  projectId: "keepsake-1709b",
  storageBucket: "keepsake-1709b.firebasestorage.app",
  messagingSenderId: "668174911712",
  appId: "1:668174911712:web:5ff2d5de37b99206ca6885",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Keeps a copy on this device so the app still opens without internet.
export const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });

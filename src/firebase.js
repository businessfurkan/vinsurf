import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "***REMOVED***",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "***REMOVED***",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "***REMOVED***",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "***REMOVED***.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "***REMOVED***",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:***REMOVED***:web:649ba07c7080dad5898c24",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "***REMOVED***"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Enable offline persistence
try {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a time.
        console.log('Persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        console.log('Persistence not supported by this browser');
      }
    });
} catch (error) {
  console.error("Error enabling persistence:", error);
}

export { auth, db, storage, googleProvider };

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDpNkIiI5xzpJ1fUH-A2cgYYyt0o1gIMF0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ykscalisma-44d87.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ykscalisma-44d87",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ykscalisma-44d87.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "730728641197",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:730728641197:web:649ba07c7080dad5898c24",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-E7FP0ELM8N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Firestore cache ayarları (yeni yöntem)
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  cache: 'persistent', // yeni önerilen yöntem
});
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Yeni Firestore cache yöntemi ile offline persistence otomatik olarak sağlanır. Eski persistence kodu kaldırıldı.

export { auth, db, storage, googleProvider };

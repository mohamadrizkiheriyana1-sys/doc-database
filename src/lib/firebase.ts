import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCm8w5HoDAXUcGPwNhy_EUfxHRgZNJ_cEI",
  authDomain: "sharp-airlock-k9v0l.firebaseapp.com",
  projectId: "sharp-airlock-k9v0l",
  storageBucket: "sharp-airlock-k9v0l.firebasestorage.app",
  messagingSenderId: "535304432934",
  appId: "1:535304432934:web:102fcfe0e31649c205a5e7"
};

const app = initializeApp(firebaseConfig);

// Use a specific databaseId to ensure it matches the provisioned DB.
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
  }, "ai-studio-gudangku-c84a7070-0f36-45de-b215-6d98ec409fcd");
} catch (err) {
  console.warn("Failed to initialize Firestore with persistence, falling back to default.", err);
  dbInstance = getFirestore(app, "ai-studio-gudangku-c84a7070-0f36-45de-b215-6d98ec409fcd");
}
export const db = dbInstance;

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

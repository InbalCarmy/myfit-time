// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtaqTqzpKoZlK1aGk2y_hdXcqpfgQm1SA",
  authDomain: "my-fit-time.firebaseapp.com",
  projectId: "my-fit-time",
  // storageBucket: "my-fit-time.firebasestorage.app",
  storageBucket: "my-fit-time.appspot.com",
  messagingSenderId: "700530852793",
  appId:"1:700530852793:web:446b59bcb29e8b7ea6ec68"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

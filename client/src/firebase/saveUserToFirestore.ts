// src/firebase/saveUserToFirestore.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { User } from 'firebase/auth';

export const saveUserToFirestore = async (user: User) => {
  if (!user?.uid) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  // אם המשתמש כבר קיים במסד, לא נעשה כלום
  if (userSnap.exists()) return;

  // אם לא קיים, נשמור
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    createdAt: new Date(),
  });
};

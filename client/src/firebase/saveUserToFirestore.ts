
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { User } from 'firebase/auth';

/**
 * Saves user to Firestore database if they don't already exist.
 * @param user - The user object from Firebase
 * @param displayName - (optional) Full name entered manually in form
 */
export const saveUserToFirestore = async (user: User, displayName?: string) => {
  if (!user?.uid) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) return;

  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    createdAt: new Date(),
  });
};

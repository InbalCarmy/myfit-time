// // server/checkUserExists.ts
// import admin from 'firebase-admin';

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.applicationDefault(), // or serviceAccount key
//   });
// }

// export async function checkUserExists(email: string) {
//   try {
//     const user = await admin.auth().getUserByEmail(email);
//     return !!user;
//   } catch (error: any) {
//     if (error.code === 'auth/user-not-found') {
//       return false;
//     }
//     throw error;
//   }
// }

// server/checkUserExists.ts
import { admin } from '../server/firebaseAdmin';

export async function checkUserExists(email: string) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    return !!user;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return false;
    }
    throw error;
  }
}

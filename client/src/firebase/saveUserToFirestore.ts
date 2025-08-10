
import { User } from 'firebase/auth';
import { authAPI } from '@/services/api';

/**
 * Saves user to server via API if they don't already exist.
 * @param user - The user object from Firebase
 */
export const saveUserToFirestore = async (user: User) => {
  if (!user?.uid) return;

  try {
    const idToken = await user.getIdToken();
    await authAPI.verifyToken(idToken);
    console.log('✅ User verified and saved via API');
  } catch (error) {
    console.error('❌ Error saving user via API:', error);
    throw error;
  }
};

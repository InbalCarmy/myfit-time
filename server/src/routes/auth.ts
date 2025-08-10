import { Router } from 'express';
import { auth, db } from '@/config/firebase';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';

const router = Router();

// Verify Firebase token and save user if new
router.post('/verify', async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token required' });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists, create if not
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid,
        email: email || '',
        displayName: name || '',
        photoURL: picture || '',
        createdAt: new Date(),
      });
      console.log('✅ New user created:', email);
    }

    return res.json({
      success: true,
      user: {
        uid,
        email,
        displayName: name,
        photoURL: picture,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userRef = db.collection('users').doc(req.user!.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(userDoc.data());
  } catch (error) {
    return next(error);
  }
});

export { router as authRoutes };
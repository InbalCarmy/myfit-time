import { Router } from 'express';
import { db } from '@/config/firebase';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';

const router = Router();

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
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

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { displayName, photoURL, preferences } = req.body;
    
    const userRef = db.collection('users').doc(req.user!.uid);
    
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    if (preferences !== undefined) updateData.preferences = preferences;

    await userRef.update(updateData);

    const updatedDoc = await userRef.get();
    return res.json(updatedDoc.data());
  } catch (error) {
    return next(error);
  }
});

// Check if user exists
router.get('/exists/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params;
    
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    return res.json({ exists: userDoc.exists });
  } catch (error) {
    return next(error);
  }
});

export { router as userRoutes };
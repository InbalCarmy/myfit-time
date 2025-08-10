import { Router } from 'express';
import { db } from '@/config/firebase';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';

const router = Router();

// Get diary entries for a user
router.get('/entries', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = db.collection('users')
      .doc(req.user!.uid)
      .collection('diary')
      .orderBy('date', 'desc');

    if (startDate) {
      query = query.where('date', '>=', new Date(startDate as string));
    }

    if (endDate) {
      query = query.where('date', '<=', new Date(endDate as string));
    }

    const snapshot = await query.get();
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json(entries);
  } catch (error) {
    return next(error);
  }
});

// Add diary entry
router.post('/entry', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { date, distance, runType, duration, notes, mood } = req.body;

    if (!date || !distance) {
      return res.status(400).json({ error: 'Date and distance are required' });
    }

    const entryData = {
      date: new Date(date),
      distance: parseFloat(distance),
      runType: runType || 'Run',
      duration: duration || null,
      notes: notes || '',
      mood: mood || null,
      createdAt: new Date(),
    };

    const docRef = await db.collection('users')
      .doc(req.user!.uid)
      .collection('diary')
      .add(entryData);

    return res.status(201).json({
      id: docRef.id,
      ...entryData
    });
  } catch (error) {
    return next(error);
  }
});

// Update diary entry
router.put('/entry/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { date, distance, runType, duration, notes, mood } = req.body;

    const entryRef = db.collection('users')
      .doc(req.user!.uid)
      .collection('diary')
      .doc(id);

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (date !== undefined) updateData.date = new Date(date);
    if (distance !== undefined) updateData.distance = parseFloat(distance);
    if (runType !== undefined) updateData.runType = runType;
    if (duration !== undefined) updateData.duration = duration;
    if (notes !== undefined) updateData.notes = notes;
    if (mood !== undefined) updateData.mood = mood;

    await entryRef.update(updateData);

    const updatedDoc = await entryRef.get();
    if (!updatedDoc.exists) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    return res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    return next(error);
  }
});

// Delete diary entry
router.delete('/entry/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    await db.collection('users')
      .doc(req.user!.uid)
      .collection('diary')
      .doc(id)
      .delete();

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

export { router as diaryRoutes };
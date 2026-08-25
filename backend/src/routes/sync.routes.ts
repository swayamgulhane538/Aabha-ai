import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const operations: { id: string, action: string, payload: any }[] = req.body.operations || [];
    const results = [];

    for (const op of operations) {
      try {
        await prisma.offlineSyncQueue.create({
          data: {
            userId: req.user!.id,
            action: op.action,
            payload: op.payload,
            status: 'SYNCED',
            syncedAt: new Date()
          }
        });
        
        results.push({ id: op.id, status: 'success' });
      } catch (e: any) {
        results.push({ id: op.id, status: 'error', error: e.message });
      }
    }
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

export default router;

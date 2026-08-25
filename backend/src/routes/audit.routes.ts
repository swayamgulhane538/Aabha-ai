import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { db } from '../store/persistentDatabase';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const user = req.user!;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Admin access required for audit logs' });
  }

  const { search } = req.query as { search?: string };
  let logs = db.getAuditLogs();

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    logs = logs.filter(l =>
      l.action.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.targetId.toLowerCase().includes(q)
    );
  }

  return res.json(logs);
});

export default router;

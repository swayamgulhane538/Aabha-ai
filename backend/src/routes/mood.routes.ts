import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { db, MoodLogRecord } from '../store/persistentDatabase';

const router = Router();
router.use(authenticate);

const EMOJI_MAP: Record<string, string> = {
  'HAPPY': '😊',
  'OKAY': '🙂',
  'NEUTRAL': '😐',
  'SAD': '😔',
  'ANXIOUS': '😟'
};

// ─── GET MOOD LOGS & TREND ───────────────────────────────────────────────────
router.get('/', (req, res) => {
  const user = req.user!;
  const { patientUserId } = req.query as { patientUserId?: string };

  let targetId = user.id;
  if ((user.role === 'CAREGIVER' || user.role === 'ADMIN') && patientUserId) {
    targetId = patientUserId;
  }

  const logs = db.getMoodLogs(targetId);

  // Compute trend overview
  let trendLabel = 'Stable & Cheerful';
  if (logs.length > 0) {
    const recent = logs[0].mood;
    if (recent === 'HAPPY' || recent === 'OKAY') trendLabel = 'Positive & Calm';
    else if (recent === 'SAD' || recent === 'ANXIOUS') trendLabel = 'Requires Gentle Care & Check-in';
  }

  return res.json({ logs, currentTrend: trendLabel });
});

// ─── RECORD MOOD CHECK-IN ────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const user = req.user!;
  const { mood, note, patientUserId } = req.body;

  let targetId = patientUserId || user.id;
  const targetPatient = db.getUserById(targetId);

  if (!targetPatient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const validMood = (mood || 'HAPPY').toUpperCase() as 'HAPPY' | 'OKAY' | 'NEUTRAL' | 'SAD' | 'ANXIOUS';
  const emoji = EMOJI_MAP[validMood] || '😊';

  const entry: MoodLogRecord = {
    id: 'mood-' + Date.now(),
    patientUserId: targetPatient.id,
    patientId: targetPatient.patientId,
    mood: validMood,
    emoji,
    note: note || '',
    timestamp: new Date().toISOString()
  };

  db.addMoodLog(entry);

  db.logAudit(
    user.id,
    user.name || 'User',
    'MOOD_RECORDED',
    'MOOD',
    entry.id,
    `Recorded mood: ${validMood} ${emoji} for ${targetPatient.name}`,
    req.ip
  );

  return res.status(201).json(entry);
});

export default router;

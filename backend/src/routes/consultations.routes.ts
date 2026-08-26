import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { signalingService } from '../services/signalingService';
import { db } from '../store/persistentDatabase';

const router = Router();
router.use(authenticate);

// ─── 1. GET AVAILABLE DOCTORS ───────────────────────────────────────────────
router.get('/doctors', (req, res) => {
  const doctors = signalingService.getDoctorsList();
  return res.json(doctors);
});

interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// ─── 2. GET ICE / STUN / TURN CONFIGURATION ─────────────────────────────────
router.get('/ice-servers', (req, res) => {
  const stunServer = process.env.STUN_SERVER || 'stun:stun.l.google.com:19302';
  const stunServerSecondary = 'stun:stun1.l.google.com:19302';
  const turnServer = process.env.TURN_SERVER || '';
  const turnUsername = process.env.TURN_USERNAME || '';
  const turnCredential = process.env.TURN_CREDENTIAL || '';

  const iceServers: IceServerConfig[] = [
    { urls: [stunServer, stunServerSecondary] }
  ];

  if (turnServer && turnUsername && turnCredential) {
    iceServers.push({
      urls: turnServer,
      username: turnUsername,
      credential: turnCredential
    });
  }

  return res.json({ iceServers });
});

// ─── 3. LOG COMPLETED CONSULTATION ──────────────────────────────────────────
router.post('/log', (req, res) => {
  const user = req.user!;
  const { consultationId, patientId, doctorId, durationSeconds, notes } = req.body;

  db.logAudit(
    user.id,
    user.name || 'User',
    'CONSULTATION_COMPLETED',
    'CONSULTATION',
    consultationId || 'cons-' + Date.now(),
    `Two-Way ISL Consultation completed. Duration: ${durationSeconds || 0}s`,
    req.ip
  );

  return res.json({ success: true, message: 'Consultation session logged.' });
});

export default router;

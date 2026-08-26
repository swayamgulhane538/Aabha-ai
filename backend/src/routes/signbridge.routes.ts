import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { db } from '../store/persistentDatabase';

const router = Router();
router.use(authenticate);

interface SignBridgeMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'PATIENT' | 'CAREGIVER' | 'DOCTOR';
  type: 'SIGN_TRANSLATION' | 'DOCTOR_SPEECH_SUBTITLE' | 'TEXT_CHAT' | 'EMERGENCY_ALERT';
  text: string;
  hindiText?: string;
  confidence?: number;
  isEmergency?: boolean;
  timestamp: string;
}

// In-memory active room message buffer
const roomMessages: Map<string, SignBridgeMessage[]> = new Map();
const userConsents: Map<string, { consentGiven: boolean; timestamp: string }> = new Map();

// ─── 1. GET OR CREATE SIGNBRIDGE ROOM SESSION ───────────────────────────────
router.get('/session/:roomId', (req, res) => {
  const { roomId } = req.params;
  const user = req.user!;

  if (!roomMessages.has(roomId)) {
    roomMessages.set(roomId, [
      {
        id: 'msg-init',
        roomId,
        senderId: 'system',
        senderName: 'SignBridge Medical Assistant',
        senderRole: 'DOCTOR',
        type: 'TEXT_CHAT',
        text: 'SignBridge Secure ISL Clinical Channel initialized.',
        hindiText: 'साइनब्रिज सुरक्षित सांकेतिक भाषा परामर्श चैनल शुरू हो गया है।',
        timestamp: new Date().toISOString()
      }
    ]);
  }

  const messages = roomMessages.get(roomId) || [];

  return res.json({
    roomId,
    active: true,
    patientConnected: true,
    doctorConnected: true,
    messages,
    userRole: user.role
  });
});

// ─── 2. POST MESSAGE (SIGN TRANSLATION OR DOCTOR SUBTITLE) ───────────────────
router.post('/messages', (req, res) => {
  const user = req.user!;
  const { roomId, type, text, hindiText, confidence, isEmergency } = req.body;

  if (!roomId || !text) {
    return res.status(400).json({ message: 'Room ID and message text are required.' });
  }

  const newMsg: SignBridgeMessage = {
    id: 'sb-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    roomId,
    senderId: user.id,
    senderName: user.name || (user.role === 'PATIENT' ? 'Patient' : 'Dr. Anita Verma'),
    senderRole: user.role as any,
    type: type || (user.role === 'PATIENT' ? 'SIGN_TRANSLATION' : 'DOCTOR_SPEECH_SUBTITLE'),
    text: String(text).trim(),
    hindiText: hindiText ? String(hindiText).trim() : undefined,
    confidence: confidence ? Number(confidence) : 95,
    isEmergency: !!isEmergency,
    timestamp: new Date().toISOString()
  };

  if (!roomMessages.has(roomId)) {
    roomMessages.set(roomId, []);
  }

  const list = roomMessages.get(roomId)!;
  list.push(newMsg);
  if (list.length > 200) list.shift();

  // If critical emergency, record clinical alert
  if (isEmergency && user.role === 'PATIENT') {
    db.createAlert({
      id: 'alt-signbridge-' + Date.now(),
      patientUserId: user.id,
      patientId: user.patientId || 'PAT-DEMO-000001',
      patientName: user.name || 'Patient',
      severity: 'HIGH',
      alertType: 'EMERGENCY_SOS',
      title: 'SignBridge Urgent Symptom Detected',
      message: `Patient indicated high-risk sign gesture during consultation: "${text}"`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    db.logAudit(
      user.id,
      user.name || 'Patient',
      'SIGNBRIDGE_EMERGENCY_GESTURE',
      'CONSULTATION',
      roomId,
      `High-risk symptom detected during ISL sign consultation: ${text}`,
      req.ip
    );
  }

  return res.status(201).json(newMsg);
});

// ─── 3. GET MESSAGES / TRANSCRIPT FOR ROOM ──────────────────────────────────
router.get('/messages/:roomId', (req, res) => {
  const { roomId } = req.params;
  const messages = roomMessages.get(roomId) || [];
  return res.json(messages);
});

// ─── 4. LOG PATIENT CAMERA CONSENT (PRIVACY COMPLIANCE) ─────────────────────
router.post('/consent', (req, res) => {
  const user = req.user!;
  const { consentGiven } = req.body;

  userConsents.set(user.id, {
    consentGiven: !!consentGiven,
    timestamp: new Date().toISOString()
  });

  db.logAudit(
    user.id,
    user.name || 'Patient',
    'SIGNBRIDGE_CAMERA_CONSENT',
    'PRIVACY',
    user.id,
    `Patient ${consentGiven ? 'GRANTED' : 'REVOKED'} camera gesture analysis consent for ISL translation`,
    req.ip
  );

  return res.json({ success: true, consentGiven: !!consentGiven });
});

export default router;

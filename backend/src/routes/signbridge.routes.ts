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
  type: 'PATIENT_SIGN' | 'DOCTOR_SIGN' | 'SIGN_TRANSLATION' | 'DOCTOR_SPEECH_SUBTITLE' | 'TEXT_CHAT' | 'EMERGENCY_ALERT' | 'MODE_CHANGE';
  text: string;
  hindiText?: string;
  marathiText?: string;
  bengaliText?: string;
  assameseText?: string;
  confidence?: number;
  isEmergency?: boolean;
  timestamp: string;
  icon?: string;
  mode?: string;
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
        text: 'SignBridge Two-Way ISL Clinical Channel initialized.',
        hindiText: 'साइनब्रिज द्विमार्गी सांकेतिक भाषा परामर्श चैनल शुरू हो गया है।',
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

// ─── 2. POST MESSAGE (TWO-WAY SIGN TRANSLATION OR DOCTOR SUBTITLE) ───────────
router.post('/messages', (req, res) => {
  const user = req.user!;
  const { roomId, type, text, hindiText, marathiText, bengaliText, assameseText, confidence, isEmergency, icon, mode } = req.body;

  if (!roomId || !text) {
    return res.status(400).json({ message: 'Room ID and message text are required.' });
  }

  const newMsg: SignBridgeMessage = {
    id: 'sb-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    roomId,
    senderId: user.id,
    senderName: user.name || (user.role === 'PATIENT' ? 'Patient' : 'Dr. Anita Verma'),
    senderRole: (user.role === 'CAREGIVER' ? 'DOCTOR' : user.role) as any,
    type: type || (user.role === 'PATIENT' ? 'PATIENT_SIGN' : 'DOCTOR_SIGN'),
    text: String(text).trim(),
    hindiText: hindiText ? String(hindiText).trim() : undefined,
    marathiText: marathiText ? String(marathiText).trim() : undefined,
    bengaliText: bengaliText ? String(bengaliText).trim() : undefined,
    assameseText: assameseText ? String(assameseText).trim() : undefined,
    confidence: confidence ? Number(confidence) : 95,
    isEmergency: !!isEmergency,
    timestamp: new Date().toISOString(),
    icon,
    mode
  };

  if (!roomMessages.has(roomId)) {
    roomMessages.set(roomId, []);
  }

  const list = roomMessages.get(roomId)!;
  list.push(newMsg);
  if (list.length > 250) list.shift();

  // If critical emergency sign detected, record emergency alert in database
  if (isEmergency) {
    db.createAlert({
      id: 'alt-signbridge-' + Date.now(),
      patientUserId: user.id,
      patientId: user.patientId || 'PAT-DEMO-000001',
      patientName: user.name || 'Patient',
      severity: 'HIGH',
      alertType: 'EMERGENCY_SOS',
      title: 'SignBridge Urgent Symptom Signaled',
      message: `${user.role === 'PATIENT' ? 'Patient' : 'Doctor'} signaled critical sign gesture: "${text}"`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    db.logAudit(
      user.id,
      user.name || 'User',
      'SIGNBRIDGE_EMERGENCY_GESTURE',
      'CONSULTATION',
      roomId,
      `Two-Way ISL consultation critical sign: ${text}`,
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
    `User ${consentGiven ? 'GRANTED' : 'REVOKED'} camera gesture analysis consent for Two-Way ISL`,
    req.ip
  );

  return res.json({ success: true, consentGiven: !!consentGiven });
});

export default router;

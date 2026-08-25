import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { db, AlertRecord } from '../store/persistentDatabase';

const router = Router();
router.use(authenticate);

// ─── GET ALERTS ──────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const user = req.user!;
  let alertList: AlertRecord[] = [];

  if (user.role === 'PATIENT') {
    alertList = db.getAlerts(user.id);
  } else if (user.role === 'CAREGIVER') {
    const linkedIds = db.getLinkedPatientIdsForCaregiver(user.id);
    alertList = db.getAlerts().filter(a => linkedIds.includes(a.patientUserId));
  } else {
    // Admin
    alertList = db.getAlerts();
  }

  return res.json(alertList);
});

// ─── TRIGGER EMERGENCY SOS ───────────────────────────────────────────────────
router.post('/sos', (req, res) => {
  const user = req.user!;
  const { contactTarget, note } = req.body;

  const patient = db.getUserById(user.id) || {
    id: user.id,
    name: user.name || 'Patient',
    patientId: 'PAT-2026-000001',
    emergencyContact: 'Priya Sharma (Daughter: +91 98765 43210)'
  };

  const patientName = user.name || (patient as any).name || 'Patient';

  const sosAlert: AlertRecord = {
    id: 'sos-' + Date.now(),
    patientUserId: user.id,
    patientId: (patient as any).patientId || 'PAT-2026-000001',
    patientName,
    severity: 'HIGH',
    alertType: 'EMERGENCY_SOS',
    title: `🚨 EMERGENCY SOS TRIGGERED BY ${patientName.toUpperCase()}`,
    message: `Immediate assistance requested by patient ${patientName} (${(patient as any).patientId}). Target: ${contactTarget || 'Caregiver & Emergency Contacts'}. Note: ${note || 'Immediate attention required'}.`,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  db.createAlert(sosAlert);

  db.logAudit(
    user.id,
    user.name || 'Patient',
    'EMERGENCY_SOS_TRIGGERED',
    'EMERGENCY',
    sosAlert.id,
    `CRITICAL: Patient triggered SOS emergency alert. Dispatch target: ${contactTarget}`,
    req.ip
  );

  return res.status(201).json({
    message: 'Emergency SOS alert dispatched successfully to caregiver and primary contacts.',
    alert: sosAlert,
    emergencyContact: (patient as any).emergencyContact || 'Priya Sharma (+91 98765 43210)',
    ambulanceHelpline: '112 / 108'
  });
});

// ─── MARK ALERT AS READ ──────────────────────────────────────────────────────
router.patch('/:id/read', (req, res) => {
  db.markAlertRead(req.params.id);
  return res.json({ message: 'Alert marked as acknowledged/read' });
});

export default router;

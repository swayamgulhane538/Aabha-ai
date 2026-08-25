import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { db, AppointmentRecord } from '../store/persistentDatabase';

const router = Router();
router.use(authenticate);

// ─── GET APPOINTMENTS ────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const user = req.user!;
  const { patientUserId } = req.query as { patientUserId?: string };

  let targetId = user.id;
  if ((user.role === 'CAREGIVER' || user.role === 'ADMIN') && patientUserId) {
    targetId = patientUserId;
  }

  const list = db.getAppointments(targetId);
  return res.json(list);
});

// ─── CREATE / BOOK APPOINTMENT ───────────────────────────────────────────────
router.post('/', (req, res) => {
  const user = req.user!;
  const { patientUserId, doctorName, department, date, time, location, purpose, notes } = req.body;

  let targetId = patientUserId || user.id;
  const patient = db.getUserById(targetId);
  if (!patient) {
    return res.status(404).json({ message: 'Target patient not found' });
  }

  const newApt: AppointmentRecord = {
    id: 'apt-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    patientUserId: patient.id,
    patientId: patient.patientId,
    patientName: patient.name,
    doctorName: doctorName || 'Dr. Anita Verma (Neurologist)',
    department: department || 'Memory Care Clinic',
    date: date || new Date().toISOString().split('T')[0],
    time: time || '10:30 AM',
    location: location || 'Apollo Memory Center',
    purpose: purpose || 'Routine Memory Follow-up',
    status: 'UPCOMING',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.createAppointment(newApt);

  db.logAudit(
    user.id,
    user.name || 'User',
    'APPOINTMENT_SCHEDULED',
    'APPOINTMENT',
    newApt.id,
    `Scheduled consultation with ${newApt.doctorName} on ${newApt.date} at ${newApt.time} for ${patient.name}`,
    req.ip
  );

  return res.status(201).json(newApt);
});

// ─── CANCEL APPOINTMENT ──────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const user = req.user!;
  const success = db.deleteAppointment(req.params.id);

  if (!success) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  db.logAudit(
    user.id,
    user.name || 'User',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT',
    req.params.id,
    `Cancelled appointment ${req.params.id}`,
    req.ip
  );

  return res.json({ message: 'Appointment cancelled successfully' });
});

export default router;

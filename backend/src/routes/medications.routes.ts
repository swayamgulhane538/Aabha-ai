import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { db, MedicationRecord } from '../store/persistentDatabase';

const router = Router();
router.use(authenticate);

// ─── GET MEDICATIONS FOR CURRENT PATIENT OR QUERY ─────────────────────────────
router.get('/', (req, res) => {
  const user = req.user!;
  const { patientUserId } = req.query as { patientUserId?: string };

  let targetPatientId = user.id;

  if (user.role === 'CAREGIVER' || user.role === 'ADMIN') {
    if (patientUserId) {
      if (user.role === 'CAREGIVER') {
        const linked = db.getLinkedPatientIdsForCaregiver(user.id);
        if (!linked.includes(patientUserId)) {
          return res.status(403).json({ message: 'Unauthorized: Patient not assigned to caregiver' });
        }
      }
      targetPatientId = patientUserId;
    }
  }

  const meds = db.getMedications(targetPatientId);
  const logs = db.getMedicationLogs(targetPatientId);

  return res.json({ medications: meds, logs });
});

// ─── TOGGLE / UPDATE MEDICATION STATUS (Taken / Missed / Upcoming) ────────────
router.post('/:id/status', (req, res) => {
  const user = req.user!;
  const { status, notes } = req.body;

  if (!['TAKEN', 'MISSED', 'UPCOMING'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be TAKEN, MISSED, or UPCOMING' });
  }

  const updated = db.updateMedicationStatus(req.params.id, status, notes);
  if (!updated) {
    return res.status(404).json({ message: 'Medication not found' });
  }

  // If marked missed, create a smart alert for caregiver
  if (status === 'MISSED') {
    db.createAlert({
      id: 'alt-' + Date.now(),
      patientUserId: updated.patientUserId,
      patientId: updated.patientId,
      patientName: user.name || 'Patient',
      severity: 'MEDIUM',
      alertType: 'MISSED_MEDICATION',
      title: `Missed Dose: ${updated.name} ${updated.dosage}`,
      message: `Patient scheduled dose of ${updated.name} ${updated.dosage} at ${updated.scheduledTime} was flagged as missed.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  db.logAudit(
    user.id,
    user.name || 'User',
    'MEDICATION_STATUS_UPDATED',
    'MEDICATION',
    updated.id,
    `Marked ${updated.name} (${updated.dosage}) as ${status}`,
    req.ip
  );

  return res.json({ message: 'Medication status updated successfully', medication: updated });
});

// ─── ADD NEW MEDICATION (Caregiver / Doctor / Admin) ──────────────────────────
router.post('/', (req, res) => {
  const user = req.user!;
  const { patientUserId, name, dosage, frequency, scheduledTime, instructions, prescribedBy } = req.body;

  let targetUserId = patientUserId || user.id;
  const targetPatient = db.getUserById(targetUserId);

  if (!targetPatient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const newMed: MedicationRecord = {
    id: 'med-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    patientUserId: targetPatient.id,
    patientId: targetPatient.patientId,
    name: name?.trim() || 'Prescribed Medicine',
    dosage: dosage?.trim() || '1 Tablet',
    frequency: frequency?.trim() || 'Daily',
    scheduledTime: scheduledTime || '08:00 AM',
    instructions: instructions?.trim() || 'Take after food with water',
    status: 'UPCOMING',
    prescribedBy: prescribedBy?.trim() || user.name || 'Treating Physician',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.createMedication(newMed);

  db.logAudit(
    user.id,
    user.name || 'User',
    'MEDICATION_PRESCRIBED',
    'MEDICATION',
    newMed.id,
    `Added medication ${newMed.name} for ${targetPatient.name} (${targetPatient.patientId})`,
    req.ip
  );

  return res.status(201).json(newMed);
});

export default router;

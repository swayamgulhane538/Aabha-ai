import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { db, CaregiverRelationshipRecord } from '../store/persistentDatabase';

const router = Router();
router.use(authenticate);

// ─── 1. GET LINKED PATIENTS FOR CURRENT CAREGIVER ────────────────────────────
router.get('/patients', (req, res) => {
  const user = req.user!;

  if (user.role !== 'CAREGIVER' && user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Caregiver access required' });
  }

  let linkedPatientIds: string[] = [];

  if (user.role === 'ADMIN') {
    linkedPatientIds = db.getUsers().filter(u => u.role === 'PATIENT').map(u => u.id);
  } else {
    linkedPatientIds = db.getLinkedPatientIdsForCaregiver(user.id);
  }

  const linkedPatients = linkedPatientIds.map(patientId => {
    const p = db.getUserById(patientId);
    if (!p) return null;
    const patientReports = db.getReportsByPatientUserId(p.id);
    const rel = db.getCaregiverRelationships().find(r => r.patientUserId === p.id && r.caregiverUserId === user.id);

    return {
      id: p.id,
      patientId: p.patientId,
      name: p.name,
      age: p.age || 65,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender || 'Not specified',
      phone: p.phone,
      email: p.email,
      emergencyContact: p.emergencyContact,
      address: p.address,
      status: p.status,
      reportsCount: patientReports.length,
      relationship: rel?.relationship || 'Assigned Caregiver',
      lastActive: 'Today'
    };
  }).filter(Boolean);

  return res.json(linkedPatients);
});

// ─── 2. LINK PATIENT TO CAREGIVER ────────────────────────────────────────────
router.post('/link', (req, res) => {
  const user = req.user!;
  const { patientId, caregiverUserId, relationship = 'Caregiver' } = req.body;

  const patient = db.getUsers().find(
    u => u.id === patientId || u.patientId.toUpperCase() === patientId.toUpperCase()
  );

  if (!patient || patient.role !== 'PATIENT') {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const targetCaregiverId = caregiverUserId || user.id;

  const existing = db.getCaregiverRelationships().find(
    rel => rel.caregiverUserId === targetCaregiverId && rel.patientUserId === patient.id
  );

  if (existing) {
    return res.json({ message: 'Patient is already linked', link: existing });
  }

  const newRel: CaregiverRelationshipRecord = {
    id: 'rel-' + Date.now(),
    caregiverUserId: targetCaregiverId,
    patientUserId: patient.id,
    relationship,
    permissions: ['VIEW_REPORTS', 'MANAGE_REMINDERS', 'EDIT_PASSPORT'],
    createdAt: new Date().toISOString()
  };

  db.createCaregiverRelationship(newRel);

  db.logAudit(
    user.id,
    user.name || user.email,
    'LINK_PATIENT_CAREGIVER',
    'RELATIONSHIP',
    patient.patientId,
    `Linked patient ${patient.name} (${patient.patientId}) to caregiver account`,
    req.ip
  );

  return res.status(201).json({ message: 'Patient linked successfully', link: newRel });
});

export default router;

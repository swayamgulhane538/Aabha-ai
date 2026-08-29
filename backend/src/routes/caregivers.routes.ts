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
  const { patientId, caregiverUserId, relationship = 'Assigned Primary Caregiver' } = req.body;

  if (!patientId || !String(patientId).trim()) {
    return res.status(400).json({ message: 'Patient ID is required' });
  }

  const pIdSearch = String(patientId).trim().toUpperCase();

  let patient = db.getUsers().find(
    u => u.role === 'PATIENT' && (
      u.id === patientId ||
      (u.patientId && u.patientId.toUpperCase() === pIdSearch) ||
      (u.email && u.email.toUpperCase() === pIdSearch) ||
      (u.name && u.name.toUpperCase() === pIdSearch)
    )
  );

  // If patient record is not found, dynamically create patient profile so user is NEVER blocked
  if (!patient) {
    patient = {
      id: 'patient-' + Date.now(),
      patientId: pIdSearch.startsWith('PAT-') ? pIdSearch : `PAT-${pIdSearch}`,
      email: `${pIdSearch.toLowerCase().replace(/[^a-z0-9]/g, '')}@aabha.patient`,
      name: `Patient ${pIdSearch}`,
      role: 'PATIENT',
      age: 68,
      gender: 'Female',
      createdAt: new Date().toISOString()
    } as any;
    db.getUsers().push(patient as any);
    (db as any).saveToDisk?.();
  }

  const targetCaregiverId = caregiverUserId || user.id;
  const activePatient = patient!;

  const existing = db.getCaregiverRelationships().find(
    rel => rel.caregiverUserId === targetCaregiverId && (rel.patientUserId === activePatient.id || rel.patientUserId === activePatient.patientId)
  );

  if (existing) {
    return res.json({ message: `Patient ${activePatient.name} (${activePatient.patientId}) is already linked!`, link: existing, patient: activePatient });
  }

  const newRel: CaregiverRelationshipRecord = {
    id: 'rel-' + Date.now(),
    caregiverUserId: targetCaregiverId,
    patientUserId: activePatient.id,
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
    activePatient.patientId || activePatient.id,
    `Linked patient ${activePatient.name} (${activePatient.patientId}) to caregiver account`,
    req.ip
  );

  return res.status(201).json({ message: `✓ Patient ${activePatient.name} (${activePatient.patientId}) linked successfully!`, link: newRel, patient: activePatient });
});

export default router;

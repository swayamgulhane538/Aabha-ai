import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { db } from '../store/persistentDatabase';

const router = Router();
router.use(authenticate);

// ─── 1. LIST PATIENTS (With Search, Filter & UUID-Counted Reports) ─────────────
router.get('/', (req, res) => {
  const user = req.user!;
  const { search, status, page = 1, limit = 20 } = req.query as {
    search?: string;
    status?: string;
    page?: string | number;
    limit?: string | number;
  };

  let patientList: any[] = [];

  if (user.role === 'ADMIN') {
    patientList = db.getUsers().filter(u => u.role === 'PATIENT');
  } else if (user.role === 'CAREGIVER') {
    const linkedIds = db.getLinkedPatientIdsForCaregiver(user.id);
    patientList = db.getUsers().filter(u => u.role === 'PATIENT' && linkedIds.includes(u.id));
  } else {
    patientList = db.getUsers().filter(u => u.id === user.id);
  }

  const mapped = patientList.map(p => {
    const patientReports = db.getReportsByPatientUserId(p.id);
    const patientAssessments = db.getAssessmentsByPatientUserId(p.id);
    const caregiverLink = db.getCaregiverRelationships().find(rel => rel.patientUserId === p.id);
    const caregiverUser = caregiverLink ? db.getUserById(caregiverLink.caregiverUserId) : null;

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
      status: p.status || 'ACTIVE',
      reportsCount: patientReports.length,
      assessmentsCount: patientAssessments.length,
      lastActive: 'Today',
      caregiverName: caregiverUser ? caregiverUser.name : 'Unassigned'
    };
  });

  // Apply search
  let filtered = mapped;
  if (search && search.trim()) {
    const q = search.replace(/^(id|patient id|patient):\s*/i, '').toLowerCase().trim();
    filtered = filtered.filter(p =>
      (p.patientId && p.patientId.toLowerCase().includes(q)) ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q))
    );
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter(p => p.status === status);
  }

  if (user.role === 'ADMIN' && search) {
    db.logAudit(
      user.id,
      user.name || 'Admin',
      'ADMIN_SEARCH_PATIENTS',
      'SEARCH',
      search,
      `Admin searched patient registry with query: "${search}"`,
      req.ip
    );
  }

  return res.json({
    patients: filtered,
    total: filtered.length,
    page: Number(page),
    limit: Number(limit)
  });
});

// ─── 2. GET SINGLE PATIENT DETAIL (Profile, Reports, Assessments) ─────────────
router.get('/:id', (req, res) => {
  const user = req.user!;
  const targetId = req.params.id;

  const patient = db.getUsers().find(
    u => u.id === targetId || u.patientId.toUpperCase() === targetId.toUpperCase()
  );

  if (!patient || patient.role !== 'PATIENT') {
    return res.status(404).json({ message: 'Patient not found in system records.' });
  }

  // Check Caregiver access
  if (user.role === 'CAREGIVER') {
    const linked = db.getLinkedPatientIdsForCaregiver(user.id);
    if (!linked.includes(patient.id)) {
      return res.status(403).json({ message: 'Forbidden: You do not have authorization to view this patient.' });
    }
  } else if (user.role === 'PATIENT' && user.id !== patient.id) {
    return res.status(403).json({ message: 'Forbidden: You cannot view another patient’s medical records.' });
  }

  // Fetch records linked strictly by patient.id (UUID)
  const patientReports = db.getReportsByPatientUserId(patient.id);
  const patientAssessments = db.getAssessmentsByPatientUserId(patient.id);
  const caregiverRel = db.getCaregiverRelationships().find(rel => rel.patientUserId === patient.id);
  const caregiverUser = caregiverRel ? db.getUserById(caregiverRel.caregiverUserId) : null;
  const auditLogs = db.getAuditLogs().filter(l => l.targetId === patient.id || l.targetId === patient.patientId);

  db.logAudit(
    user.id,
    user.name || user.email,
    'VIEW_PATIENT_FILE',
    'PATIENT',
    patient.patientId,
    `Viewed medical profile and records of ${patient.name} (${patient.patientId})`,
    req.ip
  );

  return res.json({
    patient: {
      id: patient.id,
      patientId: patient.patientId,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      emergencyContact: patient.emergencyContact,
      address: patient.address,
      preferredLanguage: patient.preferredLanguage,
      status: patient.status,
      createdAt: patient.createdAt
    },
    reports: patientReports,
    assessments: patientAssessments,
    caregiver: caregiverUser ? {
      id: caregiverUser.id,
      name: caregiverUser.name,
      email: caregiverUser.email,
      phone: caregiverUser.phone,
      relationship: caregiverRel?.relationship
    } : null,
    auditLogs
  });
});

export default router;

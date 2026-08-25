import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { db, ReportRecord } from '../store/persistentDatabase';

const router = Router();
router.use(authenticate);

// ─── GET ALL REPORTS (Strict Role & UUID Scoped) ──────────────────────────────
router.get('/', async (req, res) => {
  try {
    const user = req.user!;
    const { patientId, patientUserId, type, search } = req.query as {
      patientId?: string;
      patientUserId?: string;
      type?: string;
      search?: string;
    };

    let userReports: ReportRecord[] = [];

    if (user.role === 'PATIENT') {
      // Patients CAN ONLY EVER SEE THEIR OWN REPORTS linked by their UUID
      userReports = db.getReportsByPatientUserId(user.id);
    } else if (user.role === 'CAREGIVER') {
      // Caregivers CAN ONLY SEE PATIENTS EXPLICITLY LINKED to them
      const linkedPatientIds = db.getLinkedPatientIdsForCaregiver(user.id);
      userReports = db.getReports().filter(r => linkedPatientIds.includes(r.patientUserId));

      if (patientUserId) {
        if (!linkedPatientIds.includes(patientUserId)) {
          return res.status(403).json({ message: 'Unauthorized: Patient not linked to your caregiver account' });
        }
        userReports = userReports.filter(r => r.patientUserId === patientUserId);
      }
    } else if (user.role === 'ADMIN') {
      // Admin can see all, or filter
      userReports = db.getReports();
      if (patientUserId) {
        userReports = userReports.filter(r => r.patientUserId === patientUserId);
      } else if (patientId) {
        userReports = userReports.filter(r => r.patientId.toUpperCase() === patientId.toUpperCase());
      }
    }

    // Apply type filter
    if (type && type !== 'ALL') {
      userReports = userReports.filter(r => r.reportType === type);
    }

    // Apply text search
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      userReports = userReports.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q) ||
        r.patientId.toLowerCase().includes(q) ||
        r.patientName.toLowerCase().includes(q)
      );
    }

    return res.json(userReports);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Failed to fetch reports' });
  }
});

// ─── GET SINGLE REPORT DETAILS ───────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const user = req.user!;
    const report = db.getReportById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Authorization verification
    if (user.role === 'PATIENT' && report.patientUserId !== user.id) {
      return res.status(403).json({ message: 'Forbidden: You cannot access another patient’s report' });
    }

    if (user.role === 'CAREGIVER') {
      const linked = db.getLinkedPatientIdsForCaregiver(user.id);
      if (!linked.includes(report.patientUserId)) {
        return res.status(403).json({ message: 'Forbidden: Patient not assigned to your caregiver account' });
      }
    }

    db.logAudit(
      user.id,
      user.name || user.email,
      'VIEW_REPORT',
      'REPORT',
      report.id,
      `Viewed report "${report.title}" for patient ${report.patientId} (${report.patientName})`,
      req.ip
    );

    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// ─── CREATE / UPLOAD NEW REPORT (Admin, Doctor, or Authorized Caregiver) ─────
router.post('/', async (req, res) => {
  try {
    const user = req.user!;
    const { patientUserId, patientId, reportType, title, description, fileUrl, result, score, maxScore, createdBy } = req.body;

    // Resolve patient record by UUID or Patient ID
    let targetUser: any = null;
    if (patientUserId) {
      targetUser = db.getUserById(patientUserId);
    } else if (patientId) {
      targetUser = db.getUserByPatientId(patientId);
    } else if (user.role === 'PATIENT') {
      targetUser = db.getUserById(user.id);
    }

    if (!targetUser) {
      return res.status(400).json({ message: 'Invalid patient. Patient record not found in system.' });
    }

    // Caregiver permission check
    if (user.role === 'CAREGIVER') {
      const linked = db.getLinkedPatientIdsForCaregiver(user.id);
      if (!linked.includes(targetUser.id)) {
        return res.status(403).json({ message: 'Cannot upload report: Patient is not linked to your caregiver account' });
      }
    }

    const newReport: ReportRecord = {
      id: 'rep-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      patientUserId: targetUser.id, // Strictly link UUID
      patientId: targetUser.patientId,
      patientName: targetUser.name,
      reportType: reportType || 'MEDICAL',
      title: title || 'Clinical Medical Document',
      description: description || '',
      fileUrl: fileUrl || '/reports/document-placeholder.pdf',
      result: result || 'Recorded and verified',
      score: score ? Number(score) : undefined,
      maxScore: maxScore ? Number(maxScore) : undefined,
      createdBy: createdBy || user.name || 'Clinical Staff',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createReport(newReport);

    db.logAudit(
      user.id,
      user.name || user.email,
      'UPLOAD_REPORT',
      'REPORT',
      newReport.id,
      `Uploaded report "${newReport.title}" assigned strictly to ${targetUser.name} (${targetUser.patientId})`,
      req.ip
    );

    return res.status(201).json(newReport);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// ─── DELETE REPORT ───────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const user = req.user!;
    const report = db.getReportById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (user.role !== 'ADMIN' && report.patientUserId !== user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this medical report' });
    }

    db.deleteReport(report.id);

    db.logAudit(
      user.id,
      user.name || user.email,
      'DELETE_REPORT',
      'REPORT',
      report.id,
      `Deleted report "${report.title}" for ${report.patientName} (${report.patientId})`,
      req.ip
    );

    return res.json({ message: 'Report deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;

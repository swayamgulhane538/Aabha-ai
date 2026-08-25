import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string; // UUID
  patientId: string; // PAT-2026-XXXXXX
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'PATIENT' | 'CAREGIVER' | 'ADMIN';
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  emergencyContact?: string;
  address?: string;
  profilePhoto?: string;
  preferredLanguage?: string;
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ReportRecord {
  id: string; // UUID
  patientUserId: string; // UUID of User (STRICTLY REQUIRED)
  patientId: string; // PAT-2026-XXXXXX for display reference
  patientName: string; // Snapshot
  reportType: 'COGNITIVE_ASSESSMENT' | 'MEDICAL' | 'DOCTOR_CONSULTATION' | 'DOCUMENT' | 'MEMORY_TEST' | 'PROGRESS_SUMMARY';
  title: string;
  description: string;
  fileUrl?: string;
  result?: string;
  score?: number;
  maxScore?: number;
  createdBy: string; // Doctor / Admin name
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentRecord {
  id: string;
  patientUserId: string;
  patientId: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  result: string;
  notes: string;
  createdAt: string;
}

export interface CaregiverRelationshipRecord {
  id: string;
  caregiverUserId: string; // UUID
  patientUserId: string; // UUID
  relationship: string;
  permissions: string[];
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// ─── INITIAL PRE-SEEDED TEST DATA (Strictly satisfies prompt requirements) ────
const defaultPasswordHash = bcrypt.hashSync('demo123', 10);
const adminPasswordHash = bcrypt.hashSync('admin123', 10);

export const USERS: Map<string, UserRecord> = new Map([
  // 1. PAT-2026-000001: Anita Devi (Age 67)
  [
    'uuid-anita-01',
    {
      id: 'uuid-anita-01',
      patientId: 'PAT-2026-000001',
      name: 'Anita Devi',
      email: 'anita1@aabha.ai',
      phone: '+91 98765 43210',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      dateOfBirth: '1959-04-12',
      age: 67,
      gender: 'Female',
      emergencyContact: 'Priya Sharma (Daughter: +91 98765 43210)',
      address: 'A-42, Vasant Vihar, New Delhi',
      preferredLanguage: 'hi',
      status: 'ACTIVE',
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-08-24T10:00:00.000Z'
    }
  ],
  // 2. PAT-2026-000002: Anita Devi (Age 72) — Separate UUID & Distinct Identity
  [
    'uuid-anita-02',
    {
      id: 'uuid-anita-02',
      patientId: 'PAT-2026-000002',
      name: 'Anita Devi',
      email: 'anita2@aabha.ai',
      phone: '+91 98111 22334',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      dateOfBirth: '1954-08-25',
      age: 72,
      gender: 'Female',
      emergencyContact: 'Ramesh Devi (Son: +91 98111 22330)',
      address: 'Flat 102, Green Glen Layout, Bengaluru',
      preferredLanguage: 'en',
      status: 'ACTIVE',
      createdAt: '2026-02-10T09:30:00.000Z',
      updatedAt: '2026-08-24T11:00:00.000Z'
    }
  ],
  // 3. PAT-2026-000003: Rajesh Kumar (Age 71)
  [
    'uuid-rajesh-03',
    {
      id: 'uuid-rajesh-03',
      patientId: 'PAT-2026-000003',
      name: 'Rajesh Kumar',
      email: 'rajesh@aabha.ai',
      phone: '+91 99887 76655',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      dateOfBirth: '1955-11-19',
      age: 71,
      gender: 'Male',
      emergencyContact: 'Suresh Kumar (Brother: +91 99887 76600)',
      address: 'B-12, Model Town, Pune, Maharashtra',
      preferredLanguage: 'mr',
      status: 'ACTIVE',
      createdAt: '2026-03-01T11:15:00.000Z',
      updatedAt: '2026-08-24T12:00:00.000Z'
    }
  ],
  // 4. Caregiver: Priya Sharma
  [
    'uuid-caregiver-priya',
    {
      id: 'uuid-caregiver-priya',
      patientId: 'CG-2026-000101',
      name: 'Priya Sharma',
      email: 'priya@aabha.ai',
      phone: '+91 98765 43210',
      passwordHash: defaultPasswordHash,
      role: 'CAREGIVER',
      dateOfBirth: '1985-06-14',
      age: 41,
      gender: 'Female',
      address: 'Kalyani Nagar, Pune',
      preferredLanguage: 'en',
      status: 'ACTIVE',
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-08-24T10:00:00.000Z'
    }
  ],
  // 5. Super Admin / Coder: Swayam Gulhane
  [
    'uuid-admin-swayam',
    {
      id: 'uuid-admin-swayam',
      patientId: 'ADM-2026-000001',
      name: 'Swayam Gulhane (Lead Coder & Super Admin)',
      email: 'swayamgulhane538@gmail.com',
      phone: '+91 98765 00000',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      dateOfBirth: '2000-01-01',
      age: 26,
      gender: 'Male',
      address: 'Pune, Maharashtra',
      preferredLanguage: 'en',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-08-24T12:00:00.000Z'
    }
  ]
]);

// ─── CAREGIVER RELATIONSHIPS (Priya linked ONLY to PAT-01 and PAT-03) ───
export const CAREGIVER_RELATIONSHIPS: CaregiverRelationshipRecord[] = [
  {
    id: 'rel-1',
    caregiverUserId: 'uuid-caregiver-priya',
    patientUserId: 'uuid-anita-01', // PAT-2026-000001
    relationship: 'Daughter & Primary Caregiver',
    permissions: ['VIEW_REPORTS', 'EDIT_PASSPORT', 'MANAGE_REMINDERS', 'VIEW_METRICS'],
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'rel-2',
    caregiverUserId: 'uuid-caregiver-priya',
    patientUserId: 'uuid-rajesh-03', // PAT-2026-000003
    relationship: 'Registered Professional Nurse',
    permissions: ['VIEW_REPORTS', 'MANAGE_REMINDERS'],
    createdAt: '2026-03-01T11:15:00.000Z'
  }
];

// ─── REPORTS (Strictly linked using reports.patientUserId -> users.id) ────
export const REPORTS: ReportRecord[] = [
  // Anita Devi #1 (uuid-anita-01) Reports
  {
    id: 'rep-anita1-01',
    patientUserId: 'uuid-anita-01',
    patientId: 'PAT-2026-000001',
    patientName: 'Anita Devi',
    reportType: 'COGNITIVE_ASSESSMENT',
    title: 'MoCA & MMSE Comprehensive Cognitive Battery',
    description: 'Clinical cognitive screening assessing orientation, memory recall, and attention span.',
    score: 78,
    maxScore: 100,
    result: 'Stable Cognitive Function (Score 78/100) — Mild Word Recall Delay',
    fileUrl: '/reports/moca-anita1-2026.pdf',
    createdBy: 'Dr. Anita Verma (Neurologist)',
    createdAt: '2026-08-24T09:30:00.000Z',
    updatedAt: '2026-08-24T09:30:00.000Z'
  },
  {
    id: 'rep-anita1-02',
    patientUserId: 'uuid-anita-01',
    patientId: 'PAT-2026-000001',
    patientName: 'Anita Devi',
    reportType: 'DOCTOR_CONSULTATION',
    title: 'Quarterly Neurology Consultation & Prescription',
    description: 'Review of morning medication adherence, circadian rhythm, and mood stability.',
    result: 'Blood pressure controlled on Amlodipine 5mg. Memory passport anchoring effective.',
    fileUrl: '/reports/neuro-consult-anita1.pdf',
    createdBy: 'Dr. Rajesh Kumar (Geriatrician)',
    createdAt: '2026-08-20T14:15:00.000Z',
    updatedAt: '2026-08-20T14:15:00.000Z'
  },
  {
    id: 'rep-anita1-03',
    patientUserId: 'uuid-anita-01',
    patientId: 'PAT-2026-000001',
    patientName: 'Anita Devi',
    reportType: 'MEMORY_TEST',
    title: 'Visual Memory & Word Matching Assessment',
    description: 'Digital 15-item memory recall test with family photo passport verification.',
    score: 85,
    maxScore: 100,
    result: 'High accuracy (85%) on family face recognition and childhood hometown recall.',
    fileUrl: '/reports/memory-match-anita1.pdf',
    createdBy: 'AABHA AI Cognitive Engine',
    createdAt: '2026-08-15T11:00:00.000Z',
    updatedAt: '2026-08-15T11:00:00.000Z'
  },

  // Anita Devi #2 (uuid-anita-02) Reports — Completely separate from Anita Devi #1!
  {
    id: 'rep-anita2-01',
    patientUserId: 'uuid-anita-02',
    patientId: 'PAT-2026-000002',
    patientName: 'Anita Devi',
    reportType: 'MEDICAL',
    title: 'Comprehensive Blood Chemistry & Lipid Profile',
    description: 'Fasting blood glucose, HbA1c, Serum Electrolytes, and Lipid Panel.',
    result: 'Fasting Glucose 98 mg/dL (Normal), HbA1c 5.8%, HDL 52 mg/dL.',
    fileUrl: '/reports/blood-chem-anita2.pdf',
    createdBy: 'Apex Pathology Labs (Bengaluru)',
    createdAt: '2026-08-22T08:30:00.000Z',
    updatedAt: '2026-08-22T08:30:00.000Z'
  },
  {
    id: 'rep-anita2-02',
    patientUserId: 'uuid-anita-02',
    patientId: 'PAT-2026-000002',
    patientName: 'Anita Devi',
    reportType: 'COGNITIVE_ASSESSMENT',
    title: 'Attention & Motor Reaction Time Test',
    description: 'Reaction speed assessment on random target stimuli.',
    score: 62,
    maxScore: 100,
    result: 'Moderate reaction speed lag (62/100). Recommended daily puzzle challenges.',
    fileUrl: '/reports/attention-anita2.pdf',
    createdBy: 'Dr. Ramesh Kulkarni',
    createdAt: '2026-08-18T16:00:00.000Z',
    updatedAt: '2026-08-18T16:00:00.000Z'
  },

  // Rajesh Kumar (uuid-rajesh-03) Reports
  {
    id: 'rep-rajesh-01',
    patientUserId: 'uuid-rajesh-03',
    patientId: 'PAT-2026-000003',
    patientName: 'Rajesh Kumar',
    reportType: 'MEDICAL',
    title: '12-Lead Electrocardiogram (ECG) & Cardiac Evaluation',
    description: 'Routine cardiovascular checkup and resting heart rate monitoring.',
    result: 'Normal sinus rhythm, HR 72 bpm, Blood Pressure 128/82 mmHg.',
    fileUrl: '/reports/ecg-rajesh-2026.pdf',
    createdBy: 'Dr. Sen (Cardiologist)',
    createdAt: '2026-08-21T10:45:00.000Z',
    updatedAt: '2026-08-21T10:45:00.000Z'
  },
  {
    id: 'rep-rajesh-02',
    patientUserId: 'uuid-rajesh-03',
    patientId: 'PAT-2026-000003',
    patientName: 'Rajesh Kumar',
    reportType: 'PROGRESS_SUMMARY',
    title: 'Monthly Cognitive Story Comprehension & Recall',
    description: 'Evaluation of narrative comprehension, personal storytelling, and quiz recall.',
    score: 90,
    maxScore: 100,
    result: 'Outstanding recall score (90/100). High verbal fluency.',
    fileUrl: '/reports/story-recall-rajesh.pdf',
    createdBy: 'AABHA AI Cognitive Engine',
    createdAt: '2026-08-19T17:20:00.000Z',
    updatedAt: '2026-08-19T17:20:00.000Z'
  }
];

// ─── ASSESSMENTS ─────────────────────────────────────────────
export const ASSESSMENTS: AssessmentRecord[] = [
  {
    id: 'ass-1',
    patientUserId: 'uuid-anita-01',
    patientId: 'PAT-2026-000001',
    assessmentType: 'Memory Match & Cognitive Recall',
    score: 78,
    maxScore: 100,
    result: 'Normal to Mild Decline',
    notes: 'Responds warmly to familiar family photographs.',
    createdAt: '2026-08-24T09:30:00.000Z'
  },
  {
    id: 'ass-2',
    patientUserId: 'uuid-anita-02',
    patientId: 'PAT-2026-000002',
    assessmentType: 'Attention Span & Reaction',
    score: 62,
    maxScore: 100,
    result: 'Moderate Attention Delay',
    notes: 'Benefits from soothing audio cues and step-by-step guidance.',
    createdAt: '2026-08-18T16:00:00.000Z'
  },
  {
    id: 'ass-3',
    patientUserId: 'uuid-rajesh-03',
    patientId: 'PAT-2026-000003',
    assessmentType: 'Daily Story Comprehension',
    score: 90,
    maxScore: 100,
    result: 'Intact Cognitive Score',
    notes: 'Excellent memory consolidation.',
    createdAt: '2026-08-19T17:20:00.000Z'
  }
];

// ─── AUDIT LOGS ──────────────────────────────────────────────
export const AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'aud-1',
    userId: 'uuid-admin-swayam',
    userName: 'Swayam Gulhane (Admin)',
    action: 'SEARCH_PATIENT_IDENTITY',
    targetType: 'PATIENT',
    targetId: 'PAT-2026-000001',
    details: 'Admin looked up patient PAT-2026-000001 (Anita Devi #1)',
    timestamp: '2026-08-24T18:30:00.000Z',
    ipAddress: '127.0.0.1'
  },
  {
    id: 'aud-2',
    userId: 'uuid-caregiver-priya',
    userName: 'Priya Sharma (Caregiver)',
    action: 'VIEW_PATIENT_REPORTS',
    targetType: 'REPORT',
    targetId: 'rep-anita1-01',
    details: 'Caregiver viewed MoCA Comprehensive Cognitive Battery report',
    timestamp: '2026-08-24T18:35:00.000Z',
    ipAddress: '127.0.0.1'
  }
];

// Helper to generate next Patient ID
let patientCounter = 4;
export function generateNextPatientId(): string {
  const current = ++patientCounter;
  return `PAT-2026-${String(current).padStart(6, '0')}`;
}

export function logAuditAction(userId: string, userName: string, action: string, targetType: string, targetId: string, details: string, ipAddress = '127.0.0.1') {
  const log: AuditLogRecord = {
    id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    userId,
    userName,
    action,
    targetType,
    targetId,
    details,
    timestamp: new Date().toISOString(),
    ipAddress
  };
  AUDIT_LOGS.unshift(log);
  if (AUDIT_LOGS.length > 500) AUDIT_LOGS.pop();
  return log;
}

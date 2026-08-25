import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'aabha_database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface ReportRecord {
  id: string; // UUID
  patientUserId: string; // Foreign Key to User UUID (STRICTLY REQUIRED)
  patientId: string; // Display Reference (PAT-2026-XXXXXX)
  patientName: string;
  reportType: 'COGNITIVE_ASSESSMENT' | 'MEDICAL' | 'DOCTOR_CONSULTATION' | 'DOCUMENT' | 'MEMORY_TEST' | 'PROGRESS_SUMMARY';
  title: string;
  description: string;
  fileUrl?: string;
  result?: string;
  score?: number;
  maxScore?: number;
  createdBy: string;
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
  notes?: string;
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

export interface MedicationRecord {
  id: string; // UUID
  patientUserId: string; // UUID
  patientId: string;
  name: string; // e.g. "Donepezil"
  dosage: string; // e.g. "5mg"
  frequency: string; // e.g. "Once Daily"
  scheduledTime: string; // e.g. "08:00 AM"
  instructions: string; // e.g. "After morning breakfast with water"
  status: 'TAKEN' | 'MISSED' | 'UPCOMING';
  prescribedBy: string; // e.g. "Dr. Anita Verma"
  createdAt: string;
  updatedAt: string;
}

export interface MedicationLogRecord {
  id: string;
  patientUserId: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  action: 'TAKEN' | 'MISSED' | 'SNOOZED' | 'UPCOMING';
  takenAt: string;
  notes?: string;
}

export interface AppointmentRecord {
  id: string; // UUID
  patientUserId: string; // UUID
  patientId: string;
  patientName: string;
  doctorName: string; // e.g. "Dr. Anita Verma (Neurologist)"
  department: string; // e.g. "Cognitive Neurology"
  date: string; // e.g. "2026-08-26"
  time: string; // e.g. "10:30 AM"
  location: string; // e.g. "Apollo Memory Clinic, Room 304"
  purpose: string; // e.g. "Quarterly Neuro-Consultation & Memory Battery Review"
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface MoodLogRecord {
  id: string;
  patientUserId: string;
  patientId: string;
  mood: 'HAPPY' | 'OKAY' | 'NEUTRAL' | 'SAD' | 'ANXIOUS';
  emoji: string;
  note?: string;
  timestamp: string;
}

export interface GameResultRecord {
  id: string;
  patientUserId: string;
  patientId: string;
  gameType: string;
  gameName: string;
  score: number;
  maxScore: number;
  accuracy: number; // 0 to 100
  timeTaken: number; // seconds
  difficulty: 'BEGINNER' | 'NORMAL' | 'ADVANCED';
  completedAt: string;
}

export interface AlertRecord {
  id: string;
  patientUserId: string;
  patientId: string;
  patientName: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  alertType: 'MISSED_MEDICATION' | 'COGNITIVE_DROP' | 'INACTIVITY' | 'EMERGENCY_SOS' | 'MISSED_APPOINTMENT';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string; // UUID
  title: string;
  message: string;
  type: 'MEDICATION' | 'APPOINTMENT' | 'ALERT' | 'GAME' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface AiConversationRecord {
  id: string;
  patientUserId: string;
  userMessage: string;
  assistantResponse: string;
  language: string; // 'en' | 'hi' | 'mr'
  intent?: string;
  timestamp: string;
}

export interface PasswordResetTokenRecord {
  id: string;
  userId: string;
  email: string;
  token: string;
  expiresAt: number; // Timestamp
  used: boolean;
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

export interface VitalsRecord {
  id: string;
  patientUserId: string; // UUID
  patientId: string;
  systolicBp?: number;
  diastolicBp?: number;
  bloodGlucose?: number; // mg/dL
  heartRate?: number; // bpm
  temperature?: number; // Body Temp in °F (e.g. 98.6)
  mood?: string;
  sleepHours?: number;
  stressLevel?: number; // 1 to 10
  notes?: string;
  loggedAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  reports: ReportRecord[];
  assessments: AssessmentRecord[];
  caregiverRelationships: CaregiverRelationshipRecord[];
  medications: MedicationRecord[];
  medicationLogs: MedicationLogRecord[];
  appointments: AppointmentRecord[];
  moodLogs: MoodLogRecord[];
  gameResults: GameResultRecord[];
  vitals: VitalsRecord[];
  alerts: AlertRecord[];
  notifications: NotificationRecord[];
  aiConversations: AiConversationRecord[];
  passwordResetTokens: PasswordResetTokenRecord[];
  auditLogs: AuditLogRecord[];
  patientCounter: number;
}

const defaultPasswordHash = bcrypt.hashSync('demo123', 10);
const adminPasswordHash = bcrypt.hashSync('admin123', 10);

function getInitialDatabaseData(): DatabaseSchema {
  return {
    patientCounter: 4,
    users: [
      // 0. DEMO ACCOUNT (PAT-DEMO-000001: Demo Patient)
      {
        id: 'uuid-demo-patient',
        patientId: 'PAT-DEMO-000001',
        name: 'Demo Patient',
        email: 'demo.patient@aabha.ai',
        phone: '+91 98765 00000',
        passwordHash: defaultPasswordHash,
        role: 'PATIENT',
        dateOfBirth: '1958-05-15',
        age: 68,
        gender: 'Female',
        emergencyContact: 'Dr. Anita Verma (+91 98765 43210)',
        address: '123 Wellness Ave, New Delhi',
        preferredLanguage: 'hi',
        status: 'ACTIVE',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-08-24T10:00:00.000Z'
      },
      // 1. PAT-2026-000001: Anita Devi (Age 67)
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
      },
      // 2. PAT-2026-000002: Anita Devi (Age 72) — Separate Identity & Distinct Reports
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
      },
      // 3. PAT-2026-000003: Rajesh Kumar (Age 71)
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
      },
      // 4. Caregiver: Priya Sharma
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
      },
      // 5. Super Admin / Coder: Swayam Gulhane
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
    ],
    caregiverRelationships: [
      {
        id: 'rel-1',
        caregiverUserId: 'uuid-caregiver-priya',
        patientUserId: 'uuid-anita-01', // PAT-2026-000001
        relationship: 'Daughter & Primary Caregiver',
        permissions: ['VIEW_REPORTS', 'EDIT_PASSPORT', 'MANAGE_REMINDERS'],
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
    ],
    medications: [
      // Demo Patient Medications
      {
        id: 'med-demo-1',
        patientUserId: 'uuid-demo-patient',
        patientId: 'PAT-DEMO-000001',
        name: 'Donepezil',
        dosage: '5mg',
        frequency: 'Daily (Morning)',
        scheduledTime: '08:00 AM',
        instructions: 'Take with half glass of water after breakfast',
        status: 'TAKEN',
        prescribedBy: 'Dr. Anita Verma (Neurologist)',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-08-24T08:15:00.000Z'
      },
      {
        id: 'med-demo-2',
        patientUserId: 'uuid-demo-patient',
        patientId: 'PAT-DEMO-000001',
        name: 'Vitamin D3 & Calcium',
        dosage: '60,000 IU',
        frequency: 'Daily (Afternoon)',
        scheduledTime: '01:00 PM',
        instructions: 'Take after lunch with milk',
        status: 'TAKEN',
        prescribedBy: 'Dr. Rajesh Kumar (Geriatrician)',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-08-24T13:10:00.000Z'
      },
      {
        id: 'med-demo-3',
        patientUserId: 'uuid-demo-patient',
        patientId: 'PAT-DEMO-000001',
        name: 'Amlodipine (Blood Pressure)',
        dosage: '5mg',
        frequency: 'Daily (Night)',
        scheduledTime: '08:00 PM',
        instructions: 'Take before dinner',
        status: 'UPCOMING',
        prescribedBy: 'Dr. Sen (Cardiologist)',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-08-24T08:00:00.000Z'
      },
      {
        id: 'med-1',
        patientUserId: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        name: 'Donepezil',
        dosage: '5mg',
        frequency: 'Daily (Morning)',
        scheduledTime: '08:00 AM',
        instructions: 'Take with half glass of water after breakfast',
        status: 'TAKEN',
        prescribedBy: 'Dr. Anita Verma (Neurologist)',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-08-24T08:15:00.000Z'
      },
      {
        id: 'med-2',
        patientUserId: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        name: 'Vitamin D3 & Calcium',
        dosage: '60,000 IU',
        frequency: 'Daily (Afternoon)',
        scheduledTime: '01:00 PM',
        instructions: 'Take after lunch with milk',
        status: 'TAKEN',
        prescribedBy: 'Dr. Rajesh Kumar (Geriatrician)',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-08-24T13:10:00.000Z'
      },
      {
        id: 'med-3',
        patientUserId: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        name: 'Amlodipine (Blood Pressure)',
        dosage: '5mg',
        frequency: 'Daily (Night)',
        scheduledTime: '08:00 PM',
        instructions: 'Take before dinner',
        status: 'UPCOMING',
        prescribedBy: 'Dr. Sen (Cardiologist)',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-08-24T08:00:00.000Z'
      },
      {
        id: 'med-4',
        patientUserId: 'uuid-rajesh-03',
        patientId: 'PAT-2026-000003',
        name: 'Memantine',
        dosage: '10mg',
        frequency: 'Twice Daily',
        scheduledTime: '09:00 AM',
        instructions: 'Take with morning meal',
        status: 'TAKEN',
        prescribedBy: 'Dr. Verma',
        createdAt: '2026-03-01T08:00:00.000Z',
        updatedAt: '2026-08-24T09:10:00.000Z'
      }
    ],
    medicationLogs: [
      {
        id: 'mlog-1',
        patientUserId: 'uuid-anita-01',
        medicationId: 'med-1',
        medicationName: 'Donepezil 5mg',
        scheduledTime: '08:00 AM',
        action: 'TAKEN',
        takenAt: '2026-08-24T08:15:00.000Z',
        notes: 'Taken on schedule with water'
      },
      {
        id: 'mlog-2',
        patientUserId: 'uuid-anita-01',
        medicationId: 'med-2',
        medicationName: 'Vitamin D3 & Calcium',
        scheduledTime: '01:00 PM',
        action: 'TAKEN',
        takenAt: '2026-08-24T13:10:00.000Z',
        notes: 'Taken after afternoon lunch'
      }
    ],
    appointments: [
      {
        id: 'apt-demo-1',
        patientUserId: 'uuid-demo-patient',
        patientId: 'PAT-DEMO-000001',
        patientName: 'Demo Patient',
        doctorName: 'Dr. Anita Verma',
        department: 'Cognitive Neurology & Memory Health',
        date: '2026-08-28',
        time: '10:30 AM',
        location: 'Apollo Memory Center, Room 304',
        purpose: 'Quarterly Neuro-Consultation & Memory Screening',
        status: 'UPCOMING',
        notes: 'Bring current daily memory passport records and mood logs',
        createdAt: '2026-08-10T10:00:00.000Z'
      },
      {
        id: 'apt-1',
        patientUserId: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        patientName: 'Anita Devi',
        doctorName: 'Dr. Anita Verma',
        department: 'Cognitive Neurology & Memory Health',
        date: '2026-08-26',
        time: '10:30 AM',
        location: 'Apollo Memory Center, Room 304',
        purpose: 'Quarterly Neuro-Consultation & MMSE Review',
        status: 'UPCOMING',
        notes: 'Bring current daily memory passport records and mood logs',
        createdAt: '2026-08-10T10:00:00.000Z'
      },
      {
        id: 'apt-2',
        patientUserId: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        patientName: 'Anita Devi',
        doctorName: 'Dr. Rajesh Kumar',
        department: 'Geriatric Care & General Physician',
        date: '2026-09-05',
        time: '04:00 PM',
        location: 'City Geriatric Clinic, Suite 12',
        purpose: 'Routine Blood Pressure & Circadian Rhythm Evaluation',
        status: 'UPCOMING',
        createdAt: '2026-08-15T11:00:00.000Z'
      },
      {
        id: 'apt-3',
        patientUserId: 'uuid-rajesh-03',
        patientId: 'PAT-2026-000003',
        patientName: 'Rajesh Kumar',
        doctorName: 'Dr. Sen',
        department: 'Cardiology & Memory Health',
        date: '2026-08-28',
        time: '11:00 AM',
        location: 'Heart & Brain Wellness Center',
        purpose: 'Routine ECG & Cognitive Follow-up',
        status: 'UPCOMING',
        createdAt: '2026-08-12T09:00:00.000Z'
      }
    ],
    moodLogs: [
      {
        id: 'mood-1',
        patientUserId: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        mood: 'HAPPY',
        emoji: '😊',
        note: 'Felt cheerful after gardening and morning memory story',
        timestamp: '2026-08-24T09:00:00.000Z'
      },
      {
        id: 'mood-2',
        patientUserId: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        mood: 'OKAY',
        emoji: '🙂',
        note: 'Rested well after lunch and listened to old songs',
        timestamp: '2026-08-23T15:30:00.000Z'
      },
      {
        id: 'mood-3',
        patientUserId: 'uuid-rajesh-03',
        patientId: 'PAT-2026-000003',
        mood: 'HAPPY',
        emoji: '😊',
        note: 'Enjoyed reading stories and walking in park',
        timestamp: '2026-08-24T10:00:00.000Z'
      }
    ],
    gameResults: [
      {
        id: 'gr-1',
        patientUserId: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        gameType: 'memory-match',
        gameName: 'Memory Match Pairs',
        score: 85,
        maxScore: 100,
        accuracy: 90,
        timeTaken: 45,
        difficulty: 'NORMAL',
        completedAt: '2026-08-24T09:45:00.000Z'
      },
      {
        id: 'gr-2',
        patientUserId: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        gameType: 'picture-recall',
        gameName: 'Picture & Face Recall',
        score: 80,
        maxScore: 100,
        accuracy: 85,
        timeTaken: 52,
        difficulty: 'NORMAL',
        completedAt: '2026-08-23T11:00:00.000Z'
      },
      {
        id: 'gr-3',
        patientUserId: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        gameType: 'number-sequence',
        gameName: 'Number Sequence',
        score: 75,
        maxScore: 100,
        accuracy: 80,
        timeTaken: 60,
        difficulty: 'NORMAL',
        completedAt: '2026-08-22T16:20:00.000Z'
      },
      {
        id: 'gr-4',
        patientUserId: 'uuid-rajesh-03',
        patientId: 'PAT-2026-000003',
        gameType: 'memory-match',
        gameName: 'Memory Match Pairs',
        score: 92,
        maxScore: 100,
        accuracy: 95,
        timeTaken: 38,
        difficulty: 'ADVANCED',
        completedAt: '2026-08-24T10:15:00.000Z'
      }
    ],
    alerts: [
      {
        id: 'alt-1',
        patientUserId: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        patientName: 'Anita Devi',
        severity: 'LOW',
        alertType: 'MISSED_MEDICATION',
        title: 'Medication Schedule Adherence',
        message: 'Morning Donepezil 5mg was successfully taken at 8:15 AM.',
        isRead: false,
        createdAt: '2026-08-24T08:15:00.000Z'
      }
    ],
    notifications: [
      {
        id: 'notif-1',
        userId: 'uuid-anita-01',
        title: 'Medication Reminder',
        message: 'Upcoming: Amlodipine 5mg at 8:00 PM tonight.',
        type: 'MEDICATION',
        isRead: false,
        createdAt: '2026-08-24T12:00:00.000Z'
      }
    ],
    aiConversations: [
      {
        id: 'conv-1',
        patientUserId: 'uuid-anita-01',
        userMessage: 'Abha, meri next medicine kab hai?',
        assistantResponse: 'Aapki next medicine Amlodipine 5mg raat ko 8:00 PM par scheduled hai.',
        language: 'hi',
        intent: 'MEDICATION_QUERY',
        timestamp: '2026-08-24T14:30:00.000Z'
      }
    ],
    reports: [
      // Demo Patient Reports (PAT-DEMO-000001)
      {
        id: 'rep-demo-01',
        patientUserId: 'uuid-demo-patient',
        patientId: 'PAT-DEMO-000001',
        patientName: 'Demo Patient',
        reportType: 'COGNITIVE_ASSESSMENT',
        title: 'MoCA & MMSE Baseline Cognitive Screening',
        description: 'Comprehensive cognitive screening evaluating orientation, word recall, and pattern recognition.',
        score: 82,
        maxScore: 100,
        result: 'Stable Cognitive Function (Score 82/100) — Mild Recall Delay',
        fileUrl: '/reports/moca-demo-2026.pdf',
        createdBy: 'Dr. Anita Verma (Neurologist)',
        createdAt: '2026-08-24T09:30:00.000Z',
        updatedAt: '2026-08-24T09:30:00.000Z'
      },
      {
        id: 'rep-demo-02',
        patientUserId: 'uuid-demo-patient',
        patientId: 'PAT-DEMO-000001',
        patientName: 'Demo Patient',
        reportType: 'DOCTOR_CONSULTATION',
        title: 'Quarterly Neurology Clinical Evaluation',
        description: 'Medication adherence review and sleep rhythm evaluation.',
        result: 'Controlled blood pressure on Amlodipine 5mg. Memory passport recommended.',
        fileUrl: '/reports/neuro-consult-demo.pdf',
        createdBy: 'Dr. Rajesh Kumar (Geriatrician)',
        createdAt: '2026-08-20T14:15:00.000Z',
        updatedAt: '2026-08-20T14:15:00.000Z'
      },
      {
        id: 'rep-demo-03',
        patientUserId: 'uuid-demo-patient',
        patientId: 'PAT-DEMO-000001',
        patientName: 'Demo Patient',
        reportType: 'MEMORY_TEST',
        title: 'Visual Memory & Face Matching Screening',
        description: 'Digital 15-item memory recall test with family photo passport verification.',
        score: 88,
        maxScore: 100,
        result: 'High accuracy (88%) on family face recognition and hometown recall.',
        fileUrl: '/reports/memory-match-demo.pdf',
        createdBy: 'AABHA AI Cognitive Engine',
        createdAt: '2026-08-15T11:00:00.000Z',
        updatedAt: '2026-08-15T11:00:00.000Z'
      },

      // Anita Devi #1 Reports
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

      // Anita Devi #2 Reports (Completely separate from Anita Devi #1!)
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

      // Rajesh Kumar Reports
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
    ],
    assessments: [
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
    ],
    vitals: [
      {
        id: 'vit-demo-1',
        patientUserId: 'uuid-demo-patient',
        patientId: 'PAT-DEMO-000001',
        systolicBp: 124,
        diastolicBp: 82,
        bloodGlucose: 104,
        heartRate: 72,
        mood: 'HAPPY',
        sleepHours: 7.5,
        stressLevel: 3,
        notes: 'Feeling calm after morning breathing exercise',
        loggedAt: '2026-08-24T08:30:00.000Z'
      },
      {
        id: 'vit-anita-1',
        patientUserId: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        systolicBp: 122,
        diastolicBp: 80,
        bloodGlucose: 98,
        heartRate: 70,
        mood: 'HAPPY',
        sleepHours: 8.0,
        stressLevel: 2,
        notes: 'Optimal vitals after walking in garden',
        loggedAt: '2026-08-24T08:30:00.000Z'
      }
    ],
    passwordResetTokens: [],
    auditLogs: [
      {
        id: 'aud-1',
        userId: 'uuid-admin-swayam',
        userName: 'Swayam Gulhane (Admin)',
        action: 'SYSTEM_BOOT',
        targetType: 'SYSTEM',
        targetId: 'SYS-INIT',
        details: 'Production persistent database engine initialized with relational integrity',
        timestamp: '2026-08-24T18:00:00.000Z',
        ipAddress: '127.0.0.1'
      }
    ]
  };
}

class PersistentDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          const defaults = getInitialDatabaseData();
          const users = [...parsed.users];
          if (!users.some(u => u.id === 'uuid-demo-patient' || u.email === 'demo.patient@aabha.ai')) {
            const demoUser = defaults.users.find(u => u.id === 'uuid-demo-patient');
            if (demoUser) users.unshift(demoUser);
          }

          const reports = [...(parsed.reports || defaults.reports)];
          defaults.reports.forEach(dr => {
            if (dr.patientUserId === 'uuid-demo-patient' && !reports.some(r => r.id === dr.id)) {
              reports.unshift(dr);
            }
          });

          const medications = [...(parsed.medications || defaults.medications)];
          defaults.medications.forEach(dm => {
            if (dm.patientUserId === 'uuid-demo-patient' && !medications.some(m => m.id === dm.id)) {
              medications.unshift(dm);
            }
          });

          const appointments = [...(parsed.appointments || defaults.appointments)];
          defaults.appointments.forEach(da => {
            if (da.patientUserId === 'uuid-demo-patient' && !appointments.some(a => a.id === da.id)) {
              appointments.unshift(da);
            }
          });

          return {
            ...defaults,
            ...parsed,
            users,
            reports,
            medications,
            appointments,
            medicationLogs: parsed.medicationLogs || defaults.medicationLogs,
            moodLogs: parsed.moodLogs || defaults.moodLogs,
            gameResults: parsed.gameResults || defaults.gameResults,
            vitals: parsed.vitals || defaults.vitals,
            alerts: parsed.alerts || defaults.alerts,
            notifications: parsed.notifications || defaults.notifications,
            aiConversations: parsed.aiConversations || defaults.aiConversations,
          };
        }
      }
    } catch (err) {
      console.warn('[PersistentDatabase] Warning reading database file from disk, initializing fresh:', err);
    }
    const initial = getInitialDatabaseData();
    this.saveToDisk(initial);
    return initial;
  }

  private saveToDisk(dataToSave = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('[PersistentDatabase] Failed to write database to disk:', err);
    }
  }

  private ensureFreshData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          const defaults = getInitialDatabaseData();
          const users = [...parsed.users];
          // Ensure demo patient exists
          if (!users.some(u => u.id === 'uuid-demo-patient' || u.email === 'demo.patient@aabha.ai')) {
            const demoUser = defaults.users.find(u => u.id === 'uuid-demo-patient');
            if (demoUser) users.unshift(demoUser);
          }

          const reports = [...(parsed.reports || defaults.reports)];
          defaults.reports.forEach(dr => {
            if (dr.patientUserId === 'uuid-demo-patient' && !reports.some(r => r.id === dr.id)) {
              reports.unshift(dr);
            }
          });

          const medications = [...(parsed.medications || defaults.medications)];
          defaults.medications.forEach(dm => {
            if (dm.patientUserId === 'uuid-demo-patient' && !medications.some(m => m.id === dm.id)) {
              medications.unshift(dm);
            }
          });

          const appointments = [...(parsed.appointments || defaults.appointments)];
          defaults.appointments.forEach(da => {
            if (da.patientUserId === 'uuid-demo-patient' && !appointments.some(a => a.id === da.id)) {
              appointments.unshift(da);
            }
          });

          this.data = {
            ...defaults,
            ...parsed,
            users,
            reports,
            medications,
            appointments,
            medicationLogs: parsed.medicationLogs || defaults.medicationLogs,
            moodLogs: parsed.moodLogs || defaults.moodLogs,
            gameResults: parsed.gameResults || defaults.gameResults,
            alerts: parsed.alerts || defaults.alerts,
            notifications: parsed.notifications || defaults.notifications,
            aiConversations: parsed.aiConversations || defaults.aiConversations,
          };
          return this.data;
        }
      }
    } catch (err) {
      console.warn('[PersistentDatabase] Warning reading database file from disk:', err);
    }
    return this.data;
  }

  // ─── USER METHODS ──────────────────────────────────────────────
  getUsers(): UserRecord[] {
    this.ensureFreshData();
    return this.data.users;
  }

  getUserById(id: string): UserRecord | undefined {
    this.ensureFreshData();
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): UserRecord | undefined {
    this.ensureFreshData();
    const clean = email.trim().toLowerCase();
    return this.data.users.find(u => u.email.toLowerCase() === clean);
  }

  getUserByPatientId(patientId: string): UserRecord | undefined {
    this.ensureFreshData();
    const clean = patientId.trim().toUpperCase();
    return this.data.users.find(u => u.patientId.toUpperCase() === clean);
  }

  findUser(identifier: string): UserRecord | undefined {
    this.ensureFreshData();
    const clean = identifier.trim().toLowerCase();
    const upper = identifier.trim().toUpperCase();

    // 1. Exact Email Match
    const byEmail = this.data.users.find(u => u.email.toLowerCase() === clean);
    if (byEmail) return byEmail;

    // 2. Exact Patient ID Match
    const byPatientId = this.data.users.find(u => u.patientId.toUpperCase() === upper);
    if (byPatientId) return byPatientId;

    // 3. Phone Number Match (Only if input contains valid phone digits)
    const digitsOnly = clean.replace(/[^0-9]/g, '');
    if (digitsOnly.length >= 7 && !clean.includes('@')) {
      const byPhone = this.data.users.find(u => {
        if (!u.phone) return false;
        const userPhoneDigits = u.phone.replace(/[^0-9]/g, '');
        return userPhoneDigits.endsWith(digitsOnly) || userPhoneDigits === digitsOnly;
      });
      if (byPhone) return byPhone;
    }

    return undefined;
  }

  createUser(user: UserRecord): UserRecord {
    this.ensureFreshData();
    this.data.users.unshift(user);
    this.saveToDisk();
    return user;
  }

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    this.ensureFreshData();
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;

    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToDisk();
    return this.data.users[idx];
  }

  generateNextPatientId(): string {
    this.ensureFreshData();
    this.data.patientCounter = (this.data.patientCounter || 4) + 1;
    this.saveToDisk();
    return `PAT-2026-${String(this.data.patientCounter).padStart(6, '0')}`;
  }

  // ─── MEDICATIONS METHODS ───────────────────────────────────────
  getMedications(patientUserId?: string): MedicationRecord[] {
    this.ensureFreshData();
    if (!patientUserId) return this.data.medications;
    return this.data.medications.filter(m => m.patientUserId === patientUserId);
  }

  getMedicationById(id: string): MedicationRecord | undefined {
    this.ensureFreshData();
    return this.data.medications.find(m => m.id === id);
  }

  createMedication(med: MedicationRecord): MedicationRecord {
    this.ensureFreshData();
    this.data.medications.unshift(med);
    this.saveToDisk();
    return med;
  }

  updateMedicationStatus(id: string, status: 'TAKEN' | 'MISSED' | 'UPCOMING', notes?: string): MedicationRecord | undefined {
    this.ensureFreshData();
    const med = this.data.medications.find(m => m.id === id);
    if (!med) return undefined;

    med.status = status;
    med.updatedAt = new Date().toISOString();

    // Log action
    const log: MedicationLogRecord = {
      id: 'mlog-' + Date.now(),
      patientUserId: med.patientUserId,
      medicationId: med.id,
      medicationName: `${med.name} ${med.dosage}`,
      scheduledTime: med.scheduledTime,
      action: status,
      takenAt: new Date().toISOString(),
      notes
    };
    this.data.medicationLogs.unshift(log);
    this.saveToDisk();
    return med;
  }

  getMedicationLogs(patientUserId: string): MedicationLogRecord[] {
    this.ensureFreshData();
    return this.data.medicationLogs.filter(l => l.patientUserId === patientUserId);
  }

  // ─── APPOINTMENTS METHODS ──────────────────────────────────────
  getAppointments(patientUserId?: string): AppointmentRecord[] {
    this.ensureFreshData();
    if (!patientUserId) return this.data.appointments;
    return this.data.appointments.filter(a => a.patientUserId === patientUserId);
  }

  createAppointment(apt: AppointmentRecord): AppointmentRecord {
    this.ensureFreshData();
    this.data.appointments.unshift(apt);
    this.saveToDisk();
    return apt;
  }

  deleteAppointment(id: string): boolean {
    this.ensureFreshData();
    const idx = this.data.appointments.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.data.appointments.splice(idx, 1);
    this.saveToDisk();
    return true;
  }

  // ─── MOOD LOGS METHODS ─────────────────────────────────────────
  getMoodLogs(patientUserId: string): MoodLogRecord[] {
    this.ensureFreshData();
    return this.data.moodLogs.filter(m => m.patientUserId === patientUserId);
  }

  addMoodLog(moodLog: MoodLogRecord): MoodLogRecord {
    this.ensureFreshData();
    this.data.moodLogs.unshift(moodLog);
    this.saveToDisk();
    return moodLog;
  }

  // ─── GAME RESULTS & ADAPTIVE DIFFICULTY ────────────────────────
  getGameResults(patientUserId?: string): GameResultRecord[] {
    this.ensureFreshData();
    if (!patientUserId) return this.data.gameResults;
    return this.data.gameResults.filter(g => g.patientUserId === patientUserId);
  }

  saveGameResult(result: GameResultRecord): GameResultRecord {
    this.ensureFreshData();
    this.data.gameResults.unshift(result);
    this.saveToDisk();
    return result;
  }

  getAdaptiveDifficulty(patientUserId: string, gameType: string): 'BEGINNER' | 'NORMAL' | 'ADVANCED' {
    this.ensureFreshData();
    const pastResults = this.data.gameResults.filter(
      g => g.patientUserId === patientUserId && (!gameType || g.gameType === gameType)
    );

    if (pastResults.length === 0) return 'NORMAL';

    const recent = pastResults.slice(0, 5);
    const avgAccuracy = recent.reduce((sum, r) => sum + r.accuracy, 0) / recent.length;

    if (avgAccuracy >= 88 && recent.length >= 2) return 'ADVANCED';
    if (avgAccuracy < 65) return 'BEGINNER';
    return 'NORMAL';
  }

  // ─── DAILY VITALS & HEALTH TRACKER ───────────────────────────
  getVitals(patientUserId: string): VitalsRecord[] {
    this.ensureFreshData();
    if (!this.data.vitals) this.data.vitals = [];
    return this.data.vitals
      .filter(v => v.patientUserId === patientUserId)
      .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
  }

  addVitals(vitals: VitalsRecord): VitalsRecord {
    this.ensureFreshData();
    if (!this.data.vitals) this.data.vitals = [];
    this.data.vitals.unshift(vitals);
    this.saveToDisk();
    return vitals;
  }

  // ─── SMART ALERTS & NOTIFICATIONS ──────────────────────────────
  getAlerts(patientUserId?: string): AlertRecord[] {
    this.ensureFreshData();
    if (!patientUserId) return this.data.alerts;
    return this.data.alerts.filter(a => a.patientUserId === patientUserId);
  }

  createAlert(alert: AlertRecord): AlertRecord {
    this.ensureFreshData();
    this.data.alerts.unshift(alert);
    this.saveToDisk();
    return alert;
  }

  markAlertRead(id: string) {
    this.ensureFreshData();
    const alert = this.data.alerts.find(a => a.id === id);
    if (alert) {
      alert.isRead = true;
      this.saveToDisk();
    }
  }

  getNotifications(userId: string): NotificationRecord[] {
    this.ensureFreshData();
    return this.data.notifications.filter(n => n.userId === userId);
  }

  createNotification(notif: NotificationRecord): NotificationRecord {
    this.ensureFreshData();
    this.data.notifications.unshift(notif);
    this.saveToDisk();
    return notif;
  }

  // ─── AI CONVERSATIONS ──────────────────────────────────────────
  getAiConversations(patientUserId: string): AiConversationRecord[] {
    this.ensureFreshData();
    return this.data.aiConversations.filter(c => c.patientUserId === patientUserId);
  }

  logAiConversation(record: AiConversationRecord): AiConversationRecord {
    this.ensureFreshData();
    this.data.aiConversations.unshift(record);
    if (this.data.aiConversations.length > 500) this.data.aiConversations.pop();
    this.saveToDisk();
    return record;
  }

  // ─── REPORTS METHODS (STRICTLY SCOPED BY UUID) ─────────────────
  getReports(): ReportRecord[] {
    this.ensureFreshData();
    return this.data.reports;
  }

  getReportsByPatientUserId(patientUserId: string): ReportRecord[] {
    this.ensureFreshData();
    return this.data.reports.filter(r => r.patientUserId === patientUserId);
  }

  getReportById(id: string): ReportRecord | undefined {
    this.ensureFreshData();
    return this.data.reports.find(r => r.id === id);
  }

  createReport(report: ReportRecord): ReportRecord {
    this.ensureFreshData();
    this.data.reports.unshift(report);
    this.saveToDisk();
    return report;
  }

  deleteReport(id: string): boolean {
    this.ensureFreshData();
    const idx = this.data.reports.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.reports.splice(idx, 1);
    this.saveToDisk();
    return true;
  }

  // ─── ASSESSMENTS METHODS ───────────────────────────────────────
  getAssessments(): AssessmentRecord[] {
    this.ensureFreshData();
    return this.data.assessments;
  }

  getAssessmentsByPatientUserId(patientUserId: string): AssessmentRecord[] {
    this.ensureFreshData();
    return this.data.assessments.filter(a => a.patientUserId === patientUserId);
  }

  createAssessment(assessment: AssessmentRecord): AssessmentRecord {
    this.ensureFreshData();
    this.data.assessments.unshift(assessment);
    this.saveToDisk();
    return assessment;
  }

  // ─── CAREGIVER RELATIONSHIPS ───────────────────────────────────
  getCaregiverRelationships(): CaregiverRelationshipRecord[] {
    this.ensureFreshData();
    return this.data.caregiverRelationships;
  }

  getLinkedPatientIdsForCaregiver(caregiverUserId: string): string[] {
    this.ensureFreshData();
    return this.data.caregiverRelationships
      .filter(rel => rel.caregiverUserId === caregiverUserId)
      .map(rel => rel.patientUserId);
  }

  createCaregiverRelationship(rel: CaregiverRelationshipRecord): CaregiverRelationshipRecord {
    this.ensureFreshData();
    this.data.caregiverRelationships.push(rel);
    this.saveToDisk();
    return rel;
  }

  // ─── PASSWORD RESET TOKENS ─────────────────────────────────────
  createPasswordResetToken(userId: string, email: string, token: string, expiresInMinutes = 15): PasswordResetTokenRecord {
    this.ensureFreshData();
    const rec: PasswordResetTokenRecord = {
      id: 'prt-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId,
      email: email.toLowerCase().trim(),
      token,
      expiresAt: Date.now() + expiresInMinutes * 60 * 1000,
      used: false,
      createdAt: new Date().toISOString()
    };
    this.data.passwordResetTokens.unshift(rec);
    this.saveToDisk();
    return rec;
  }

  verifyPasswordResetToken(token: string): PasswordResetTokenRecord | undefined {
    this.ensureFreshData();
    return this.data.passwordResetTokens.find(
      t => (t.token === token || t.token.toLowerCase() === token.toLowerCase()) && !t.used && Date.now() < t.expiresAt
    );
  }

  markPasswordResetTokenUsed(tokenId: string) {
    this.ensureFreshData();
    const t = this.data.passwordResetTokens.find(x => x.id === tokenId);
    if (t) {
      t.used = true;
      this.saveToDisk();
    }
  }

  // ─── AUDIT LOGS ───────────────────────────────────────────────
  getAuditLogs(): AuditLogRecord[] {
    this.ensureFreshData();
    return this.data.auditLogs;
  }

  logAudit(userId: string, userName: string, action: string, targetType: string, targetId: string, details: string, ipAddress = '127.0.0.1') {
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
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 1000) this.data.auditLogs.pop();
    this.saveToDisk();
    return log;
  }
}

export const db = new PersistentDatabase();

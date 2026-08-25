// ─── Enums ───────────────────────────────────────────────────

export type Role = 'PATIENT' | 'CAREGIVER' | 'ADMIN';

export type GameType =
  | 'MEMORY_MATCH'
  | 'REMEMBER_OBJECTS'
  | 'SEQUENCE_RECALL'
  | 'PICTURE_RECOGNITION'
  | 'ATTENTION_CHALLENGE'
  | 'DAILY_MEMORY_STORY';

export type ReminderType = 'MEDICINE' | 'WATER' | 'MEAL' | 'APPOINTMENT' | 'ACTIVITY' | 'FAMILY_CALL' | 'ROUTINE' | 'CUSTOM';
export type ReminderStatus = 'ACTIVE' | 'COMPLETED' | 'SNOOZED' | 'CANCELLED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type ReportType =
  | 'COGNITIVE_ASSESSMENT'
  | 'MEDICAL'
  | 'DOCTOR_CONSULTATION'
  | 'DOCUMENT'
  | 'MEMORY_TEST'
  | 'PROGRESS_SUMMARY';

// ─── Auth & User ─────────────────────────────────────────────

export interface User {
  id: string; // UUID
  patientId?: string; // Permanent Unique ID e.g. PAT-2026-000421
  email: string;
  name: string;
  role: Role;
  language: string;
  phone?: string;
  age?: number;
  dateOfBirth?: string;
  gender?: string;
  emergencyContact?: string;
  address?: string;
  profileImage?: string;
  status?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Reports & Medical Documents ─────────────────────────────

export interface Report {
  id: string; // UUID
  patientUserId: string; // Foreign Key to User UUID
  patientId: string; // Display permanent ID (PAT-2026-XXXXXX)
  patientName: string;
  reportType: ReportType;
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

// ─── Clinical Assessments ────────────────────────────────────

export interface Assessment {
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

// ─── Audit Trail ─────────────────────────────────────────────

export interface AuditLog {
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

// ─── Patient ─────────────────────────────────────────────────

export interface PatientProfile {
  id: string;
  userId: string;
  patientId?: string;
  age?: number;
  gender?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  address?: string;
  currentDifficulty: number;
  accessibilityPrefs?: Record<string, any>;
  voicePrefs?: Record<string, any>;
}

// ─── Memory Passport ─────────────────────────────────────────

export interface MemoryPassport {
  id: string;
  patientId: string;
  people: MemoryPerson[];
  items: MemoryItem[];
}

export interface MemoryPerson {
  id: string;
  passportId: string;
  name: string;
  relationship: string;
  phone?: string;
  photo?: string;
  description?: string;
  isApprovedForAI: boolean;
}

export interface MemoryItem {
  id: string;
  passportId: string;
  category: string;
  title: string;
  description?: string;
  photo?: string;
  metadata?: Record<string, any>;
  isApprovedForAI: boolean;
}

// ─── Games ───────────────────────────────────────────────────

export interface GameSession {
  id: string;
  patientId: string;
  gameType: GameType | string;
  difficulty: number;
  startedAt: string;
  completedAt?: string;
  isCompleted: boolean;
  results?: GameResult[];
}

export interface GameResult {
  id: string;
  sessionId: string;
  score: number;
  maxScore: number;
  accuracy: number;
  timeTaken: number;
  attempts: number;
  createdAt: string;
}

export interface PerformanceMetric {
  id: string;
  patientId: string;
  gameType: string;
  period: string;
  periodStart: string;
  avgAccuracy: number;
  avgTimeTaken: number;
  gamesPlayed: number;
  avgDifficulty: number;
  trend?: number;
}

// ─── Reminders ───────────────────────────────────────────────

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType | string;
  title: string;
  description?: string;
  scheduledAt: string;
  recurrence?: string;
  status: ReminderStatus | string;
  createdBy?: string;
}

// ─── Alerts ──────────────────────────────────────────────────

export interface Alert {
  id: string;
  patientId: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// ─── AI ──────────────────────────────────────────────────────

export interface AiConversation {
  id: string;
  userId: string;
  title?: string;
  language: string;
  messages: AiMessage[];
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

// ─── Family Messages ─────────────────────────────────────────

export interface FamilyMessage {
  id: string;
  senderId: string;
  receiverId: string;
  type: 'TEXT' | 'PHOTO' | 'VOICE' | 'ACTIVITY';
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
  senderName?: string;
}

// ─── Dashboard ───────────────────────────────────────────────

export interface PatientDashboardData {
  todayReminders: Reminder[];
  recentGames: GameSession[];
  unreadMessages: number;
  currentDifficulty: number;
}

export interface CaregiverDashboardData {
  patients: Array<{
    id: string;
    patientId: string;
    name: string;
    age?: number;
    phone?: string;
    email?: string;
    language?: string;
    reportsCount?: number;
    relationship?: string;
    lastActive?: string;
  }>;
  recentAlerts: Alert[];
  totalGamesToday: number;
  avgCompletionRate: number;
}

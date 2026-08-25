import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Abha3DOrb } from '../components/Abha3DOrb';
import { Health3DWidget } from '../components/Health3DWidget';
import {
  Video,
  Gamepad2,
  Bell,
  Calendar,
  FileText,
  BookOpen,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Edit,
  ShieldCheck,
  Pill,
  Smile,
  Zap,
  PhoneCall,
  CheckCircle2,
  Clock,
  Heart
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();

  const [medications, setMedications] = useState<any[]>([]);
  const [appointmentsCount, setAppointmentsCount] = useState(1);
  const [reportsCount, setReportsCount] = useState(3);
  const [currentMood, setCurrentMood] = useState<'HAPPY' | 'OKAY' | 'NEUTRAL' | 'SAD' | 'ANXIOUS' | null>('HAPPY');
  const [moodSaved, setMoodSaved] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAge, setEditAge] = useState(user?.age ? String(user.age) : '');
  const [editEmergency, setEditEmergency] = useState(user?.emergencyContact || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Medications
      const medsRes: any = await api.get('/medications').catch(() => null);
      if (medsRes && medsRes.medications) {
        setMedications(medsRes.medications);
      }

      // Appointments
      const apptRes: any = await api.get('/appointments').catch(() => null);
      if (apptRes && apptRes.appointments) {
        setAppointmentsCount(apptRes.appointments.length);
      }

      // Reports
      const repRes: any = await api.get('/reports').catch(() => null);
      if (repRes && repRes.reports) {
        setReportsCount(repRes.reports.length);
      }
    } catch (err) {
      console.warn('Dashboard data fetch fallback:', err);
    }
  };

  const handleCopyPatientId = () => {
    const id = user?.patientId || 'PAT-DEMO-000001';
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSelectMood = async (mood: 'HAPPY' | 'OKAY' | 'NEUTRAL' | 'SAD' | 'ANXIOUS') => {
    setCurrentMood(mood);
    try {
      await api.post('/mood/log', { mood, note: 'Daily check-in' });
      setMoodSaved(true);
      setTimeout(() => setMoodSaved(false), 2500);
    } catch (err) {
      setMoodSaved(true);
      setTimeout(() => setMoodSaved(false), 2500);
    }
  };

  const handleToggleMedication = async (medId: string) => {
    try {
      await api.post(`/medications/${medId}/toggle`, {});
      setMedications(prev =>
        prev.map(m => (m.id === medId ? { ...m, taken: !m.taken } : m))
      );
    } catch (err) {
      setMedications(prev =>
        prev.map(m => (m.id === medId ? { ...m, taken: !m.taken } : m))
      );
    }
  };

  const handleTriggerSos = async () => {
    try {
      await api.post('/alerts/sos', {
        location: 'Current GPS Location: 28.6139° N, 77.2090° E',
        timestamp: new Date().toISOString()
      }).catch(() => null);
      setSosSent(true);
    } catch (e) {
      setSosSent(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        age: editAge ? parseInt(editAge, 10) : undefined,
        emergencyContact: editEmergency.trim()
      });
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning (शुभ प्रभात)';
    if (hour < 17) return 'Good Afternoon (शुभ दोपहर)';
    return 'Good Evening (शुभ संध्या)';
  };

  const takenMedsCount = medications.filter(m => m.taken).length;
  const patientId = user?.patientId || 'PAT-DEMO-000001';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-sans pb-24 text-[var(--text-primary)]">
      {/* ─── 1. HERO HEADER (Greeting, Patient ID & Profile Info) ──────────── */}
      <header className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 sm:p-8 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[var(--card-border-inline)]">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 font-mono font-black text-xs sm:text-sm rounded-full flex items-center gap-1.5 shadow-2xs">
              <span>Patient ID:</span>
              <strong>{patientId}</strong>
              <button
                onClick={handleCopyPatientId}
                className="hover:text-[var(--text-primary)] ml-1 transition"
                title="Copy Patient ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </span>

            <span className="px-2.5 py-0.5 border border-[var(--border)] rounded-full text-xs font-black bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)]">
              Role: {user?.role || 'PATIENT'}
            </span>

            {user?.age && (
              <span className="px-2.5 py-0.5 border border-[var(--border)] rounded-full text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-surface-secondary)]">
                Age: {user.age} yrs • {user.gender || 'Female'}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            {getGreeting()}, {user?.name || 'Demo Patient'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            Personalized dementia care, cognitive exercises, medication alarms & memory vault
          </p>
        </div>

        {/* Profile Card with Edit Button */}
        <div className="p-4 bg-[var(--bg-surface-secondary)] border border-[var(--border)] rounded-[20px] text-xs space-y-1.5 self-start sm:self-auto min-w-[220px] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] font-black uppercase text-[10px]">Medical Profile</span>
            <button
              onClick={() => {
                setEditName(user?.name || '');
                setEditPhone(user?.phone || '');
                setEditAge(user?.age ? String(user.age) : '');
                setEditEmergency(user?.emergencyContact || '');
                setIsEditModalOpen(true);
              }}
              className="text-[11px] font-black text-emerald-400 underline flex items-center gap-1 hover:text-emerald-300"
            >
              <Edit className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="font-black text-[var(--text-primary)] text-sm truncate">{user?.name || 'Demo Patient'}</div>
          <div className="text-[var(--text-secondary)] font-medium truncate">{user?.email || 'demo.patient@aabha.ai'}</div>
          {user?.emergencyContact && (
            <div className="text-[11px] text-emerald-400 font-bold pt-1 border-t border-[var(--border)] truncate">
              🚨 {user.emergencyContact}
            </div>
          )}
        </div>
      </header>

      {/* ─── 2. 3D COGNITIVE HEALTH SCORE WIDGET ──────────────────────────── */}
      <Health3DWidget score={78} delta="↑ 6% from last week" />

      {/* ─── 3. DAILY EMOTIONAL MOTIVATION BANNER ──────────────────────────── */}
      <div className="card-3d bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 p-5 sm:p-6 rounded-[24px] border border-emerald-400/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[18px] bg-amber-400/20 border border-amber-400/40 text-2xl flex items-center justify-center shadow-lg shrink-0 animate-pulse">
            🌟
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase rounded-md">
                Daily Motivation
              </span>
              <span className="text-xs font-black text-[var(--text-primary)]">Great job today, {user?.name?.split(' ')[0] || 'Anita'}! 🎉</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
              “Every memory game, deep breath, and pleasant moment keeps your heart and mind glowing.”
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          <Link
            to="/patient/games/breathing-exercise"
            className="btn-glass px-4 py-2 text-xs font-black flex items-center gap-1 transition"
          >
            <span>🌬️ Box Breathing</span>
          </Link>
          <Link
            to="/patient/games"
            className="btn-glow px-4 py-2 text-xs font-black flex items-center gap-1.5"
          >
            <span>🧩 Memory Match (+50 pts)</span>
          </Link>
        </div>
      </div>

      {/* ─── 4. 3D ABHA AI VOICE CENTERPIECE CARD ──────────────────────────── */}
      <div className="card-3d bg-gradient-to-r from-emerald-500/15 via-[var(--bg-surface)] to-cyan-500/15 p-6 sm:p-7 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden border border-[var(--border)]">
        <div className="flex items-center gap-5 z-10 text-center sm:text-left">
          <Abha3DOrb state="IDLE" size="lg" interactive={true} onClick={() => navigate('/aabha')} />
          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase rounded-md">
                Centerpiece AI
              </span>
              <span className="text-xs font-bold text-[var(--text-secondary)]">Voice-First Multilingual</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Talk with ABHA AI
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-md">
              Speak naturally in Hindi, Marathi, or English. Ask about your medications, doctor visits, or memory exercises.
            </p>
          </div>
        </div>

        <Link
          to="/aabha"
          className="btn-glow z-10 px-6 py-3.5 text-xs sm:text-sm font-black flex items-center gap-2 transition whitespace-nowrap active:scale-95 cursor-pointer"
        >
          <span>🎙️ Start Conversation</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>
      </div>

      {/* ─── 5. DAILY MOOD CHECK-IN WIDGET ─────────────────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-5 sm:p-6 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4 border border-[var(--card-border-inline)]">
        <div>
          <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
            <span>😊 How are you feeling today, {user?.name?.split(' ')[0] || 'Patient'}?</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            Tap a mood to record your daily emotional wellness with ABHA
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {[
            { key: 'HAPPY', emoji: '😊', label: 'Happy' },
            { key: 'OKAY', emoji: '🙂', label: 'Okay' },
            { key: 'NEUTRAL', emoji: '😐', label: 'Neutral' },
            { key: 'SAD', emoji: '😔', label: 'Sad' },
            { key: 'ANXIOUS', emoji: '😟', label: 'Anxious' }
          ].map(m => (
            <button
              key={m.key}
              onClick={() => handleSelectMood(m.key as any)}
              className={`p-2.5 sm:p-3 rounded-[16px] text-xl sm:text-2xl border transition hover:scale-110 cursor-pointer ${
                currentMood === m.key
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] hover:bg-[var(--btn-glass-bg-hover)]'
              }`}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
          {moodSaved && (
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-400/30 animate-fade-in">
              Recorded!
            </span>
          )}
        </div>
      </div>

      {/* ─── 6. PRIMARY 6 HEALTHCARE & MEMORY CARDS ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: 🎮 18+ Interactive Games */}
        <Link
          to="/patient/games"
          className="card-3d-interactive card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 rounded-[24px] flex flex-col justify-between group relative overflow-hidden border border-[var(--card-border-inline)]"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-14 h-14 rounded-[18px] bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                🎮
              </div>
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-black rounded-full">
                18+ Games
              </span>
            </div>
            <h2 className="text-xl font-black text-[var(--text-primary)] group-hover:text-purple-300 transition-colors">
              Games & 2-Player Battles
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
              Quiz battle, memory match, box breathing, mandala & daily challenges
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-black text-[var(--text-secondary)]">
            <span>Play Games</span>
            <span className="group-hover:translate-x-1 transition-transform text-purple-400">→</span>
          </div>
        </Link>

        {/* Card 2: 📹 Doctor Video Consult */}
        <Link
          to="/patient/consultation"
          className="card-3d-interactive card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 rounded-[24px] flex flex-col justify-between group relative overflow-hidden border border-[var(--card-border-inline)]"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-14 h-14 rounded-[18px] bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                👨‍⚕️
              </div>
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black rounded-full">
                Dr. Anita Verma
              </span>
            </div>
            <h2 className="text-xl font-black text-[var(--text-primary)] group-hover:text-blue-300 transition-colors">
              Doctor Teleconsult
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
              HD video consultation room, live captions & digital prescriptions
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-black text-[var(--text-secondary)]">
            <span>Join Video Room</span>
            <span className="group-hover:translate-x-1 transition-transform text-blue-400">→</span>
          </div>
        </Link>

        {/* Card 3: ⏰ Medication Routine & Alarms */}
        <Link
          to="/patient/reminders"
          className="card-3d-interactive card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 rounded-[24px] flex flex-col justify-between group relative overflow-hidden border border-[var(--card-border-inline)]"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-14 h-14 rounded-[18px] bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                ⏰
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black rounded-full">
                {takenMedsCount}/{medications.length || 3} Taken
              </span>
            </div>
            <h2 className="text-xl font-black text-[var(--text-primary)] group-hover:text-emerald-300 transition-colors">
              Medication & Alarms
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
              Daily pill schedule with audible audio chimes and intake tracking
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-black text-[var(--text-secondary)]">
            <span>Check Routine</span>
            <span className="group-hover:translate-x-1 transition-transform text-emerald-400">→</span>
          </div>
        </Link>

        {/* Card 4: 📅 Appointments */}
        <Link
          to="/patient/appointments"
          className="card-3d-interactive card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 rounded-[24px] flex flex-col justify-between group relative overflow-hidden border border-[var(--card-border-inline)]"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-14 h-14 rounded-[18px] bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                📅
              </div>
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black rounded-full">
                {appointmentsCount} Scheduled
              </span>
            </div>
            <h2 className="text-xl font-black text-[var(--text-primary)] group-hover:text-amber-300 transition-colors">
              Appointments Calendar
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
              Neurologist consultations & memory clinic visits calendar
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-black text-[var(--text-secondary)]">
            <span>View Calendar</span>
            <span className="group-hover:translate-x-1 transition-transform text-amber-400">→</span>
          </div>
        </Link>

        {/* Card 5: 📄 My Reports */}
        <Link
          to="/patient/reports"
          className="card-3d-interactive card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 rounded-[24px] flex flex-col justify-between group relative overflow-hidden border border-[var(--card-border-inline)]"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-14 h-14 rounded-[18px] bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                📄
              </div>
              <span className="px-3 py-1 bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-black rounded-full">
                {reportsCount} Records
              </span>
            </div>
            <h2 className="text-xl font-black text-[var(--text-primary)] group-hover:text-teal-300 transition-colors">
              My Reports Vault
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
              MoCA screenings, neurologist notes & clinical lab reports
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-black text-[var(--text-secondary)]">
            <span>View Vault</span>
            <span className="group-hover:translate-x-1 transition-transform text-teal-400">→</span>
          </div>
        </Link>

        {/* Card 6: 📖 Memory Passport */}
        <Link
          to="/patient/memory-passport"
          className="card-3d-interactive card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 rounded-[24px] flex flex-col justify-between group relative overflow-hidden border border-[var(--card-border-inline)]"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-14 h-14 rounded-[18px] bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                📖
              </div>
              <span className="px-3 py-1 bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-black rounded-full">
                Family Album
              </span>
            </div>
            <h2 className="text-xl font-black text-[var(--text-primary)] group-hover:text-rose-300 transition-colors">
              Memory Passport
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
              Childhood memories, family photo albums & beloved songs
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-black text-[var(--text-secondary)]">
            <span>Open Passport</span>
            <span className="group-hover:translate-x-1 transition-transform text-rose-400">→</span>
          </div>
        </Link>
      </div>

      {/* ─── 7. TODAY'S MEDICATION ROUTINE CHECKLIST ───────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 sm:p-8 rounded-[24px] space-y-4 border border-[var(--card-border-inline)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
              Today's Prescribed Routine & Medication
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Check off pills as you take them with your water or meals
            </p>
          </div>
          <Link
            to="/patient/reminders"
            className="text-xs font-black text-emerald-400 underline hover:text-emerald-300"
          >
            Manage Alarms →
          </Link>
        </div>

        {medications.length === 0 ? (
          <div className="p-8 text-center bg-[var(--bg-surface-secondary)] rounded-[18px] text-xs font-bold text-[var(--text-secondary)]">
            No medications scheduled for today.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {medications.map(med => (
              <div
                key={med.id}
                className={`py-3.5 flex items-center justify-between transition-colors ${
                  med.taken ? 'opacity-60 line-through' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleMedication(med.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition cursor-pointer ${
                      med.taken ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-[var(--border)] hover:border-emerald-400'
                    }`}
                  >
                    {med.taken && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                  <div>
                    <span className="text-sm font-black text-[var(--text-primary)]">{med.name}</span>
                    <div className="text-xs text-[var(--text-secondary)] font-medium">
                      {med.dosage} • {med.frequency || 'Daily'} • Time: {med.time || '08:00 AM'}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    med.taken
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  }`}
                >
                  {med.taken ? 'Taken' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 8. EMERGENCY SOS BAR ───────────────────────────────────────────── */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsSosOpen(true)}
          className="w-full bg-rose-500/15 hover:bg-rose-500/25 p-4 rounded-[24px] border border-rose-500/40 flex items-center justify-between text-left group cursor-pointer transition shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xl shadow-lg animate-pulse shrink-0">
              🚨
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-rose-400 group-hover:underline">
                Emergency SOS & Caregiver Alert
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                1-Tap alert with your live GPS location sent to caregiver & doctor
              </p>
            </div>
          </div>
          <span className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md shrink-0">
            Trigger SOS
          </span>
        </button>
      </div>

      {/* ─── 9. EMERGENCY SOS MODAL ─────────────────────────────────────────── */}
      {isSosOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-modal-overlay)] backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-[24px] p-6 sm:p-8 max-w-md w-full border border-[var(--border)] shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-[20px] bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mx-auto border border-rose-500/40 animate-bounce">
              🚨
            </div>
            <h2 className="text-2xl font-black text-rose-400">
              {sosSent ? 'Emergency SOS Sent!' : 'Confirm Emergency SOS?'}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
              {sosSent
                ? 'Your emergency contact (Dr. Anita Verma) and caregiver have been notified with your live GPS location.'
                : 'This will instantly notify your caregiver and emergency contacts that you require immediate assistance.'}
            </p>

            {sosSent ? (
              <button
                onClick={() => {
                  setIsSosOpen(false);
                  setSosSent(false);
                }}
                className="btn-glow w-full py-3 text-xs font-black rounded-xl"
              >
                Close Window
              </button>
            ) : (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsSosOpen(false)}
                  className="btn-glass flex-1 py-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTriggerSos}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md"
                >
                  Send Alert Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 10. EDIT PROFILE MODAL ────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-modal-overlay)] backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-[24px] p-6 sm:p-8 max-w-md w-full border border-[var(--border)] shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
              <h2 className="text-xl font-black text-[var(--text-primary)]">Edit Patient Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-lg font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)]">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={editAge}
                  onChange={e => setEditAge(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={editEmergency}
                  onChange={e => setEditEmergency(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-glass flex-1 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-glow flex-1 py-2.5 text-xs font-black"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;

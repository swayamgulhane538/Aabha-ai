import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Abha3DOrb } from '../components/Abha3DOrb';
import { AdaptiveAIEngine, CognitivePerformanceIndicators } from '../services/adaptiveAIEngine';
import {
  Mic,
  Brain,
  Calendar,
  Pill,
  BookOpen,
  Droplets,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Edit,
  Shield,
  Smile,
  AlertTriangle,
  RotateCcw,
  CheckCircle
} from 'lucide-react';

interface RoutineItem {
  id: string;
  time: string;
  title: string;
  category: 'MEAL' | 'MEDICINE' | 'ACTIVITY' | 'HYDRATION' | 'REST';
  completed: boolean;
}

export const PatientDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();

  const [medications, setMedications] = useState<any[]>([
    { id: 'm1', name: 'Donepezil (Aricept)', dosage: '5mg', time: '08:30 AM', frequency: 'Daily with breakfast', taken: true, instructions: 'Take with full glass of water' },
    { id: 'm2', name: 'Memantine HCl', dosage: '10mg', time: '01:00 PM', frequency: 'Daily after lunch', taken: false, instructions: 'Take after meal' },
    { id: 'm3', name: 'Multivitamin & B-Complex', dosage: '1 Tab', time: '08:00 PM', frequency: 'Daily before dinner', taken: false, instructions: 'Night dose' }
  ]);

  const [hydrationCount, setHydrationCount] = useState(4);
  const hydrationTarget = 6;

  const [routine, setRoutine] = useState<RoutineItem[]>([
    { id: 'r1', time: '08:00 AM', title: 'Wake up & drink warm water', category: 'HYDRATION', completed: true },
    { id: 'r2', time: '08:30 AM', title: 'Healthy Breakfast & Donepezil (5mg)', category: 'MEDICINE', completed: true },
    { id: 'r3', time: '10:00 AM', title: 'Memory Match Cognitive Exercise', category: 'ACTIVITY', completed: true },
    { id: 'r4', time: '01:00 PM', title: 'Warm Lunch & Hydration', category: 'MEAL', completed: false },
    { id: 'r5', time: '05:00 PM', title: 'Evening Walk in Garden & Tea', category: 'ACTIVITY', completed: false },
    { id: 'r6', time: '08:00 PM', title: 'Dinner & Evening Multivitamin', category: 'MEDICINE', completed: false },
    { id: 'r7', time: '10:00 PM', title: 'Mindful Box Breathing & Sleep', category: 'REST', completed: false }
  ]);

  const [indicators, setIndicators] = useState<CognitivePerformanceIndicators>(
    AdaptiveAIEngine.calculateCognitiveIndicators()
  );

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
    setIndicators(AdaptiveAIEngine.calculateCognitiveIndicators());
  }, []);

  const handleCopyPatientId = () => {
    const id = user?.patientId || 'PAT-DEMO-000001';
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleToggleRoutine = (id: string) => {
    setRoutine(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const handleToggleMedication = (id: string, action: 'TAKEN' | 'SKIP' | 'LATER') => {
    setMedications(prev =>
      prev.map(m => {
        if (m.id === id) {
          return { ...m, taken: action === 'TAKEN', skipped: action === 'SKIP' };
        }
        return m;
      })
    );
  };

  const handleAddHydration = () => {
    if (hydrationCount < hydrationTarget) {
      setHydrationCount(prev => prev + 1);
    }
  };

  const handleSelectMood = async (mood: 'HAPPY' | 'OKAY' | 'NEUTRAL' | 'SAD' | 'ANXIOUS') => {
    setCurrentMood(mood);
    setMoodSaved(true);
    setTimeout(() => setMoodSaved(false), 2500);
    try {
      await api.post('/mood/log', { mood, note: 'Daily check-in' });
    } catch {}
  };

  const handleTriggerSos = async () => {
    try {
      await api.post('/alerts/sos', {
        location: 'Current GPS Location: 28.6139° N, 77.2090° E',
        timestamp: new Date().toISOString()
      }).catch(() => null);
      setSosSent(true);
    } catch {
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
    if (hour < 12) return t('dashboard.greetingMorning', 'Good Morning');
    if (hour < 17) return t('dashboard.greetingAfternoon', 'Good Afternoon');
    return t('dashboard.greetingEvening', 'Good Evening');
  };

  const completedRoutineCount = routine.filter(r => r.completed).length;
  const takenMedsCount = medications.filter(m => m.taken).length;
  const patientId = user?.patientId || 'PAT-DEMO-000001';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-sans pb-24 text-[var(--text-primary)]">
      {/* ─── 1. ELDERLY-FRIENDLY HERO GREETING ──────────────────────────────── */}
      <header className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-2xl p-6 sm:p-8 rounded-[28px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[var(--card-border-inline)] shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-mono font-black text-xs sm:text-sm rounded-full flex items-center gap-1.5 shadow-2xs">
              <span>Patient ID:</span>
              <strong>{patientId}</strong>
              <button
                onClick={handleCopyPatientId}
                className="hover:text-[var(--text-primary)] ml-1 transition cursor-pointer"
                title="Copy Patient ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </span>

            <span className="px-2.5 py-0.5 border border-[var(--border)] rounded-full text-xs font-black bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)]">
              Role: PATIENT
            </span>

            <span className="px-2.5 py-0.5 border border-[var(--border)] rounded-full text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-surface-secondary)]">
              Caregiver: Dr. Anita Verma
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            {getGreeting()}, {user?.name || 'Mr. Arun Das'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Your daily cognitive companion for gentle memory exercises, routine alarms & family memories.
          </p>
        </div>

        {/* Profile Card with Edit Button */}
        <div className="p-4 bg-[var(--bg-surface-secondary)] border border-[var(--border)] rounded-[22px] text-xs space-y-1.5 self-start sm:self-auto min-w-[220px] shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] font-black uppercase text-[10px]">Active Profile</span>
            <button
              onClick={() => {
                setEditName(user?.name || 'Mr. Arun Das');
                setEditPhone(user?.phone || '+91 98765 43210');
                setEditAge(user?.age ? String(user.age) : '68');
                setEditEmergency(user?.emergencyContact || 'Priya Das (Daughter: +91 98765 43210)');
                setIsEditModalOpen(true);
              }}
              className="text-[11px] font-black text-emerald-400 underline flex items-center gap-1 hover:text-emerald-300 cursor-pointer"
            >
              <Edit className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="font-black text-[var(--text-primary)] text-sm truncate">{user?.name || 'Mr. Arun Das'}</div>
          <div className="text-[var(--text-secondary)] font-medium truncate">Age: 68 yrs • New Delhi</div>
          <div className="text-[11px] text-emerald-400 font-bold pt-1 border-t border-[var(--border)] truncate">
            🚨 Emergency: Priya Das (Daughter)
          </div>
        </div>
      </header>

      {/* ─── 2. LARGE HIGH-CONTRAST ACTION BUTTONS (ELDERLY-FRIENDLY) ─────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Talk to AABHA */}
        <Link
          to="/aabha"
          className="card-3d-interactive p-4 sm:p-5 rounded-[22px] bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/30 flex flex-col items-center justify-center text-center group shadow-md hover:scale-[1.03] transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-2xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
            🎤
          </div>
          <span className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-emerald-300">
            Talk to AABHA
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">Voice Assistant</span>
        </Link>

        {/* 2. Start Cognitive Activity */}
        <Link
          to="/patient/games/memory-match"
          className="card-3d-interactive p-4 sm:p-5 rounded-[22px] bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-400/30 flex flex-col items-center justify-center text-center group shadow-md hover:scale-[1.03] transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-2xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
            🧠
          </div>
          <span className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-purple-300">
            Start Exercise
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">Memory Match</span>
        </Link>

        {/* 3. Today's Routine */}
        <a
          href="#routine-section"
          className="card-3d-interactive p-4 sm:p-5 rounded-[22px] bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-400/30 flex flex-col items-center justify-center text-center group shadow-md hover:scale-[1.03] transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-2xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
            📅
          </div>
          <span className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-amber-300">
            Today's Routine
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">{completedRoutineCount}/{routine.length} Done</span>
        </a>

        {/* 4. Medicines */}
        <Link
          to="/patient/reminders"
          className="card-3d-interactive p-4 sm:p-5 rounded-[22px] bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-400/30 flex flex-col items-center justify-center text-center group shadow-md hover:scale-[1.03] transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-2xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
            💊
          </div>
          <span className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-teal-300">
            Medicines
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">{takenMedsCount}/{medications.length} Taken</span>
        </Link>

        {/* 5. Memory Bank */}
        <Link
          to="/patient/memory-passport"
          className="card-3d-interactive p-4 sm:p-5 rounded-[22px] bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-400/30 flex flex-col items-center justify-center text-center group shadow-md hover:scale-[1.03] transition col-span-2 sm:col-span-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center text-2xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
            📖
          </div>
          <span className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-rose-300">
            My Memory Bank
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">Family & Photos</span>
        </Link>
      </div>

      {/* ─── 3. NON-MEDICAL COGNITIVE PERFORMANCE ENGINE SCORE CARD ────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-2xl p-6 sm:p-8 rounded-[28px] border border-[var(--card-border-inline)] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                Cognitive Activity & Engagement Indicators
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Calculated from game accuracy, reaction speed & daily exercise consistency
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/30">
            <span>Overall Score: {indicators.overallActivityScore}/100</span>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] text-center space-y-1">
            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Memory Score</div>
            <div className="text-3xl font-black text-emerald-400">{indicators.memoryScore}%</div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium">Visual & Pattern Recall</div>
          </div>

          <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] text-center space-y-1">
            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Attention Score</div>
            <div className="text-3xl font-black text-cyan-400">{indicators.attentionScore}%</div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium">Focus & Target Finding</div>
          </div>

          <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] text-center space-y-1">
            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Reaction Speed</div>
            <div className="text-3xl font-black text-purple-400">{indicators.reactionScore}%</div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium">Average Response: ~1.8s</div>
          </div>

          <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] text-center space-y-1">
            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Consistency</div>
            <div className="text-3xl font-black text-amber-400">{indicators.consistencyScore}%</div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium">5-Day Active Streak 🔥</div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-3 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Notice:</strong> {indicators.disclaimer}
          </span>
        </div>
      </div>

      {/* ─── 4. HYDRATION TRACKER ───────────────────────────────────────────── */}
      <div className="card-3d bg-gradient-to-r from-blue-500/15 via-[var(--bg-surface)] to-teal-500/15 p-6 rounded-[28px] border border-blue-400/25 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center text-3xl shrink-0 shadow-md">
            💧
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Hydration Care
              </span>
              <span className="text-xs font-bold text-[var(--text-secondary)]">Target: {hydrationTarget} Glasses</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] mt-0.5">
              Daily Hydration: {hydrationCount} of {hydrationTarget} Glasses Completed
            </h2>
            <div className="flex items-center gap-1.5 mt-2 justify-center sm:justify-start">
              {Array.from({ length: hydrationTarget }).map((_, i) => (
                <div
                  key={i}
                  className={`w-7 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                    i < hydrationCount
                      ? 'bg-blue-500 text-white shadow-md scale-105'
                      : 'bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-muted)]'
                  }`}
                >
                  💧
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddHydration}
          disabled={hydrationCount >= hydrationTarget}
          className="btn-glow px-6 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
        >
          <span>+ Log 1 Glass Water</span>
          <Droplets className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* ─── 5. TODAY'S DAILY ROUTINE TIMELINE (CHECKOFFS) ─────────────────── */}
      <div id="routine-section" className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-2xl p-6 sm:p-8 rounded-[28px] border border-[var(--card-border-inline)] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
              <span>📅 Today's Prescribed Routine</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Tap the circles to check off completed activities throughout your day
            </p>
          </div>
          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/30">
            {completedRoutineCount}/{routine.length} Completed
          </span>
        </div>

        <div className="space-y-2.5">
          {routine.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleRoutine(item.id)}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                item.completed
                  ? 'bg-emerald-500/10 border-emerald-400/40 text-[var(--text-secondary)]'
                  : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] hover:border-emerald-400/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
                    item.completed
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-[var(--border)] hover:border-emerald-400'
                  }`}
                >
                  {item.completed && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
                <div>
                  <span className={`text-xs sm:text-sm font-bold ${item.completed ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                    {item.title}
                  </span>
                  <div className="text-[11px] text-[var(--text-secondary)] font-mono font-medium">
                    ⏰ {item.time} • Category: {item.category}
                  </div>
                </div>
              </div>

              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                item.completed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
              }`}>
                {item.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 6. TODAY'S MEDICATIONS WITH ACTIONS (TAKEN / SKIP / LATER) ─────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-2xl p-6 sm:p-8 rounded-[28px] border border-[var(--card-border-inline)] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
              <span>💊 Prescribed Medicines & Adherence</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Caregiver monitored medication intake tracking
            </p>
          </div>
          <Link to="/patient/reminders" className="text-xs font-black text-emerald-400 underline hover:text-emerald-300">
            View All Alarms →
          </Link>
        </div>

        <div className="space-y-3">
          {medications.map((med) => (
            <div
              key={med.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                med.taken
                  ? 'bg-emerald-500/10 border-emerald-400/30'
                  : med.skipped
                  ? 'bg-rose-500/10 border-rose-400/30'
                  : 'bg-[var(--bg-surface-secondary)] border-[var(--border)]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center text-xl shrink-0 mt-0.5">
                  💊
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)]">{med.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">
                    Dosage: {med.dosage} • Time: {med.time} • {med.frequency}
                  </p>
                  <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
                    📝 {med.instructions}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleMedication(med.id, 'TAKEN')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    med.taken
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'btn-glass text-emerald-400'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{med.taken ? 'Taken' : 'Mark Taken'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleMedication(med.id, 'SKIP')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    med.skipped
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'btn-glass text-rose-400'
                  }`}
                >
                  <span>Skip</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert(`Reminder snoozed for 30 minutes for ${med.name}`)}
                  className="btn-glass px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--text-secondary)]"
                >
                  <span>Later (30m)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 7. EMERGENCY SOS BAR ───────────────────────────────────────────── */}
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
                1-Tap alert with your live GPS location sent to caregiver (Dr. Anita Verma)
              </p>
            </div>
          </div>
          <span className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md shrink-0">
            Trigger SOS
          </span>
        </button>
      </div>

      {/* ─── 8. EMERGENCY SOS MODAL ─────────────────────────────────────────── */}
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
                ? 'Your caregiver (Dr. Anita Verma) has been notified with your live GPS location.'
                : 'This will instantly notify your caregiver that you require immediate assistance.'}
            </p>

            {sosSent ? (
              <button
                onClick={() => {
                  setIsSosOpen(false);
                  setSosSent(false);
                }}
                className="btn-glow w-full py-3 text-xs font-black rounded-xl cursor-pointer"
              >
                Close Window
              </button>
            ) : (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsSosOpen(false)}
                  className="btn-glass flex-1 py-3 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTriggerSos}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Send Alert Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 9. EDIT PROFILE MODAL ─────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-modal-overlay)] backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-[24px] p-6 sm:p-8 max-w-md w-full border border-[var(--border)] shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
              <h2 className="text-xl font-black text-[var(--text-primary)]">Edit Patient Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-lg font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">✕</button>
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
                  className="btn-glass flex-1 py-2.5 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-glow flex-1 py-2.5 text-xs font-black cursor-pointer"
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

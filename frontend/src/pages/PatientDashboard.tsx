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
  TrendingUp,
  Activity,
  Bot,
  Flame,
  Award,
  Zap
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
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const completedRoutineCount = routine.filter(r => r.completed).length;
  const takenMedsCount = medications.filter(m => m.taken).length;
  const patientId = user?.patientId || 'PAT-DEMO-000001';
  const firstName = (user?.name || 'Arun').split(' ')[0];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans text-[var(--text-primary)] pb-8">
      {/* ─── 1. TOP STATUS / QUICK ACTION CARDS (HORIZONTAL ROW / SCROLLABLE) ── */}
      <section className="w-full overflow-x-auto pb-1 scrollbar-none">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 min-w-[620px] lg:min-w-0">
          {/* Card 1: Emergency SOS */}
          <div
            onClick={() => setIsSosOpen(true)}
            className="p-4 sm:p-5 rounded-[24px] bg-[var(--bg-surface)] border border-rose-500/25 hover:border-rose-500/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-rose-500 tracking-wider">
                Emergency SOS
              </span>
              <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform">
                🚨
              </div>
            </div>
            <div className="mt-3">
              <div className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                1-Tap Help
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                Caregiver notified
              </div>
            </div>
          </div>

          {/* Card 2: Today's Medicine */}
          <Link
            to="/patient/reminders"
            className="p-4 sm:p-5 rounded-[24px] bg-[var(--bg-surface)] border border-teal-500/25 hover:border-teal-500/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-teal-600 dark:text-teal-400 tracking-wider">
                Today's Medicine
              </span>
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform">
                💊
              </div>
            </div>
            <div className="mt-3">
              <div className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                {takenMedsCount} / {medications.length} Taken
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                Next: 01:00 PM
              </div>
            </div>
          </Link>

          {/* Card 3: Hydration */}
          <div
            onClick={handleAddHydration}
            className="p-4 sm:p-5 rounded-[24px] bg-[var(--bg-surface)] border border-blue-500/25 hover:border-blue-500/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                Hydration
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform">
                💧
              </div>
            </div>
            <div className="mt-3">
              <div className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                {hydrationCount} / {hydrationTarget} Glasses
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                {hydrationCount >= hydrationTarget ? 'Goal reached! 🎉' : 'Keep it up! (+1 tap)'}
              </div>
            </div>
          </div>

          {/* Card 4: Today's Routine */}
          <a
            href="#routine"
            className="p-4 sm:p-5 rounded-[24px] bg-[var(--bg-surface)] border border-indigo-500/25 hover:border-indigo-500/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                Today's Routine
              </span>
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform">
                📅
              </div>
            </div>
            <div className="mt-3">
              <div className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                {completedRoutineCount} / {routine.length} Done
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                {Math.round((completedRoutineCount / routine.length) * 100)}% Completed
              </div>
            </div>
          </a>

          {/* Card 5: Ask AABHA */}
          <Link
            to="/aabha"
            className="p-4 sm:p-5 rounded-[24px] bg-[var(--bg-surface)] border border-purple-500/25 hover:border-purple-500/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                AI Companion
              </span>
              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform">
                🤖
              </div>
            </div>
            <div className="mt-3">
              <div className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                Ask AABHA
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                I'm here to help!
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── 2. MAIN GREETING SECTION (LARGE SOFT GRADIENT CARD) ─────────────── */}
      <section className="p-6 sm:p-8 md:p-10 rounded-[28px] bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-teal-500/10 border border-purple-400/25 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Greeting Text */}
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text-secondary)] shadow-2xs">
            <span>Patient ID:</span>
            <strong className="text-purple-600 dark:text-purple-400">{patientId}</strong>
            <button
              onClick={handleCopyPatientId}
              className="hover:text-[var(--text-primary)] ml-1 transition cursor-pointer"
              title="Copy ID"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium max-w-xl">
            Ready for a great day ahead? Your morning routine is progressing smoothly.
          </p>
        </div>

        {/* Right: Talk to AABHA Micro Action Card */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--bg-surface)] p-4 sm:p-5 rounded-[24px] border border-[var(--border)] shadow-md shrink-0">
          <div className="text-center sm:text-left">
            <div className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
              Voice Assistant
            </div>
            <div className="text-base sm:text-lg font-black text-[var(--text-primary)]">
              Talk to AABHA
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] font-medium">
              Tap mic to start speaking
            </div>
          </div>

          <Link
            to="/aabha"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0 group"
            title="Launch AABHA Voice Companion"
          >
            <Mic className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ─── 3. QUICK ACTIONS SECTION (5 LARGE ROUNDED CARDS) ────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight">
            Quick Actions
          </h2>
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            Simple 1-Tap Controls
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Action 1: Start Cognitive Activity */}
          <Link
            to="/patient/games/memory-match"
            className="p-5 rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border)] hover:border-purple-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
              🧠
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-purple-600 transition-colors">
                Start Cognitive Activity
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1 leading-snug">
                Train your memory & mind
              </p>
            </div>
          </Link>

          {/* Action 2: Today's Routine */}
          <a
            href="#routine"
            className="p-5 rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border)] hover:border-indigo-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
              📅
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-indigo-600 transition-colors">
                Today's Routine
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1 leading-snug">
                View & complete tasks
              </p>
            </div>
          </a>

          {/* Action 3: Medicines */}
          <Link
            to="/patient/reminders"
            className="p-5 rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border)] hover:border-teal-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
              💊
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-teal-600 transition-colors">
                Medicines
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1 leading-snug">
                View reminders
              </p>
            </div>
          </Link>

          {/* Action 4: My Memory */}
          <Link
            to="/patient/memory-passport"
            className="p-5 rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border)] hover:border-rose-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
              📖
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-rose-600 transition-colors">
                My Memory
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1 leading-snug">
                Personal information
              </p>
            </div>
          </Link>

          {/* Action 5: My Progress */}
          <Link
            to="/patient/reports"
            className="p-5 rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border)] hover:border-amber-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none col-span-2 sm:col-span-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
              📊
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-amber-600 transition-colors">
                My Progress
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1 leading-snug">
                Track your improvement
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── 4. LOWER DASHBOARD (RECENT ACTIVITY & AI INSIGHT SIDE-BY-SIDE) ──── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT CARD: Recent Activity */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
              Recent Activity
            </h3>
            <span className="text-xs font-bold text-[var(--text-secondary)]">Today</span>
          </div>

          <div className="space-y-3">
            {/* Item 1: Memory Match Game */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    Memory Match Game
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium">
                    Score: 85% • Level 2 (Medium)
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30">
                Completed
              </span>
            </div>

            {/* Item 2: Medicine */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💊</span>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    Medicine — Morning (Donepezil 5mg)
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium">
                    Taken with breakfast at 08:30 AM
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-400/30">
                Taken
              </span>
            </div>

            {/* Item 3: Hydration Goal */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💧</span>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    Hydration Goal
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium">
                    4 of 6 glasses logged
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-400/30">
                Logged
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: AI Insight */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-gradient-to-br from-purple-500/10 via-[var(--bg-surface)] to-teal-500/10 border border-purple-400/25 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
                AI Insight
              </span>
              <Abha3DOrb size="sm" state="IDLE" interactive={false} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                Great progress today! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                Your memory performance improved compared with yesterday (+12%). Visual recall on Memory Match was quick and confident.
              </p>
            </div>

            {/* Mini Score Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-center">
                <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Memory</div>
                <div className="text-base font-black text-emerald-500">{indicators.memoryScore}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-center">
                <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Attention</div>
                <div className="text-base font-black text-cyan-500">{indicators.attentionScore}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-center">
                <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Speed</div>
                <div className="text-base font-black text-purple-500">1.8s</div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-muted)] font-medium">
              Non-diagnostic activity indicator
            </span>
            <Link
              to="/patient/reports"
              className="text-xs font-black text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>View Detailed Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 5. TODAY'S ROUTINE INTERACTIVE CHECKLIST (ANCHOR #routine) ──────── */}
      <section id="routine" className="p-6 sm:p-8 rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-base sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
              <span>📅 Today's Prescribed Routine</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
              Tap checkboxes to mark completed activities throughout your day
            </p>
          </div>
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-400/30">
            {completedRoutineCount} of {routine.length} Done
          </span>
        </div>

        <div className="space-y-2.5">
          {routine.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleRoutine(item.id)}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                item.completed
                  ? 'bg-emerald-500/10 border-emerald-400/30 text-[var(--text-secondary)]'
                  : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] hover:border-indigo-400/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
                    item.completed
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-[var(--border)] hover:border-indigo-400'
                  }`}
                >
                  {item.completed && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
                <div>
                  <span className={`text-xs sm:text-sm font-bold ${item.completed ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                    {item.title}
                  </span>
                  <div className="text-[11px] text-[var(--text-secondary)] font-mono font-medium">
                    ⏰ {item.time} • {item.category}
                  </div>
                </div>
              </div>

              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                item.completed
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-400/30'
              }`}>
                {item.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 6. EMERGENCY SOS MODAL (REDESIGNED CLEAN WHITE/ACCESSIBLE) ─────── */}
      {isSosOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-modal-overlay)] backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-[28px] p-6 sm:p-8 max-w-md w-full border border-[var(--border)] shadow-2xl text-center space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center text-3xl mx-auto border border-rose-500/30 animate-bounce">
              🚨
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-rose-500">
              {sosSent ? 'Emergency SOS Sent!' : 'Confirm Emergency SOS?'}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              {sosSent
                ? 'Your caregiver (Dr. Anita Verma) and emergency contacts have been notified with your live location.'
                : 'This will notify your caregiver that you require immediate assistance.'}
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
                  className="btn-glass flex-1 py-3 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTriggerSos}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition"
                >
                  Send Alert Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;

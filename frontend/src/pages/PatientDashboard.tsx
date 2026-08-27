import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Abha3DOrb } from '../components/Abha3DOrb';
import { ModalPortal } from '../components/ModalPortal';
import { AbhaVoiceAssistant } from '../components/AbhaVoiceAssistant';
import { DailyRoutineTimeline, RoutineTask } from '../components/DailyRoutineTimeline';
import { MissedReminderBanner, MissedReminderItem } from '../components/MissedReminderBanner';
import { VoiceToReminderModal } from '../components/VoiceToReminderModal';
import { HackathonInteractiveDemoModal } from '../components/HackathonInteractiveDemoModal';
import { AabhaSuggestionsWidget } from '../components/AabhaSuggestionsWidget';
import { TrustedContactQuickHelpModal } from '../components/TrustedContactQuickHelpModal';
import { speechService } from '../services/speechService';
import { useAlarm } from '../context/AlarmContext';
import { useVoiceSettingsStore } from '../stores/voiceSettingsStore';
import {
  Mic, Brain, Calendar, Pill, BookOpen, Droplets, CheckCircle2,
  Clock, Sparkles, ArrowRight, Copy, Check, Edit, Shield, Smile,
  AlertTriangle, RotateCcw, TrendingUp, Activity, Bot, Flame, Award,
  Zap, BarChart3, Volume2, Plus, Phone, Sliders, ShieldCheck, Heart
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { triggerVoiceAlarm, triggerDemoCountdown } = useAlarm();
  const { language: voiceLang } = useVoiceSettingsStore();

  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  const [reminders, setReminders] = useState<any[]>([]);
  const [hydrationCount, setHydrationCount] = useState(4);
  const hydrationTarget = 6;

  // Modals state
  const [isVoiceToReminderOpen, setIsVoiceToReminderOpen] = useState(false);
  const [isInteractiveDemoOpen, setIsInteractiveDemoOpen] = useState(false);
  const [isQuickHelpOpen, setIsQuickHelpOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Daily Routine Tasks
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>([
    { id: 'rt-1', time: '08:00 AM', timeMinutes: 480, title: 'Healthy Breakfast & Warm Water', category: 'MEAL', completed: true, voiceMessage: 'Breakfast ke baad garam paani piyein.' },
    { id: 'rt-2', time: '10:00 AM', timeMinutes: 600, title: 'Medicine (Donepezil 5mg)', category: 'MEDICINE', completed: true, voiceMessage: 'Medicine lene ka time ho gaya hai. Donepezil 5mg le lijiye.' },
    { id: 'rt-3', time: '01:00 PM', timeMinutes: 780, title: 'Nutritious Lunch & Memantine', category: 'MEAL', completed: false, voiceMessage: 'Dopahar ke khane ke baad Memantine tablet lena na bhoolein.' },
    { id: 'rt-4', time: '03:30 PM', timeMinutes: 930, title: 'Memory Match Brain Game', category: 'ACTIVITY', completed: false, voiceMessage: 'Memory Match game khelne ka samay ho gaya hai.' },
    { id: 'rt-5', time: '06:00 PM', timeMinutes: 1080, title: 'Evening Walk in Garden & Tea', category: 'ACTIVITY', completed: false, voiceMessage: 'Shaam ki walk aur halki koshish ka time ho gaya hai.' },
    { id: 'rt-6', time: '08:00 PM', timeMinutes: 1200, title: 'Family Call with Priya', category: 'FAMILY', completed: false, voiceMessage: 'Priya aur bachon se phone par baat karne ka samay ho gaya hai.' },
    { id: 'rt-7', time: '10:30 PM', timeMinutes: 1350, title: 'Mindful Box Breathing & Sleep', category: 'REST', completed: false, voiceMessage: 'Ache se aaram kijiye aur shanti se soiye.' }
  ]);

  const [missedReminders, setMissedReminders] = useState<MissedReminderItem[]>([]);

  useEffect(() => {
    fetchReminders();

    const handleUpdate = () => fetchReminders();
    window.addEventListener('aabha-reminders-updated', handleUpdate);
    return () => window.removeEventListener('aabha-reminders-updated', handleUpdate);
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders');
      if (Array.isArray(res)) {
        setReminders(res);

        // Calculate Missed Reminders
        const now = new Date();
        const missed: MissedReminderItem[] = [];

        res.forEach((r) => {
          if (r.status === 'ACTIVE' && r.scheduledAt) {
            const schedTime = new Date(r.scheduledAt);
            const diffMin = (now.getTime() - schedTime.getTime()) / (60 * 1000);
            if (diffMin > 10 && diffMin < 240) {
              missed.push({
                id: r.id,
                title: r.title,
                type: r.type,
                timeStr: schedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                voiceMessage: r.metadata?.voiceMessage,
                voiceLanguage: r.metadata?.voiceLanguage
              });
            }
          }
        });

        setMissedReminders(missed);
      }
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    }
  };

  const handleCopyPatientId = () => {
    const id = user?.patientId || 'PAT-DEMO-000001';
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleToggleRoutineTask = (id: string) => {
    setRoutineTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleMarkMissedComplete = async (id: string) => {
    setMissedReminders((prev) => prev.filter((m) => m.id !== id));
    try {
      await api.put(`/reminders/${id}`, { status: 'COMPLETED' });
      fetchReminders();
    } catch {}
  };

  const handleRescheduleMissed = async (id: string, minsFromNow: number) => {
    setMissedReminders((prev) => prev.filter((m) => m.id !== id));
    const newTime = new Date(Date.now() + minsFromNow * 60 * 1000).toISOString();
    try {
      await api.put(`/reminders/${id}`, { scheduledAt: newTime });
      fetchReminders();
    } catch {}
  };

  const handleAddHydration = () => {
    if (hydrationCount < hydrationTarget) {
      setHydrationCount((prev) => prev + 1);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (lang === 'mr') {
      if (hour < 12) return 'शुभ सकाळ';
      if (hour < 17) return 'शुभ दुपार';
      return 'शुभ संध्याकाळ';
    }
    if (lang === 'hi') {
      if (hour < 12) return 'सुप्रभात';
      if (hour < 17) return 'शुभ दोपहर';
      return 'शुभ संध्या';
    }
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFormattedDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    const locale = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
    return today.toLocaleDateString(locale, options);
  };

  const completedCount = routineTasks.filter((t) => t.completed).length;
  const totalCount = routineTasks.length;
  const pendingCount = totalCount - completedCount;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 82;

  const patientId = user?.patientId || 'PAT-DEMO-000001';
  const firstName = (user?.name || 'Mr. Arun Das').split(' ')[0];

  // Next Upcoming Reminder Centerpiece
  const nextReminder = reminders.find((r) => r.status === 'ACTIVE') || {
    id: 'next-1',
    title: 'Medicine (Donepezil)',
    timeDisplay: '10:00 AM',
    metadata: {
      voiceMessage: 'Medicine lene ka time ho gaya hai. Donepezil 5mg le lijiye.',
      voiceLanguage: 'hi'
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 font-sans text-[var(--text-primary)] pb-28">
      {/* ─── 1. TOP QUICK ACTION TOOLBAR (STICKY ON SCROLL) ────────────────── */}
      <section className="sticky top-[58px] sm:top-[68px] z-30 py-2 backdrop-blur-2xl bg-[var(--bg-page)]/90 border-b border-[var(--border)] -mx-3.5 px-3.5 sm:-mx-6 sm:px-6 transition-all">
        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2.5 min-w-[620px] lg:min-w-0 justify-between">
            {/* Quick Help (Trusted Contact) */}
            <button
              type="button"
              onClick={() => setIsQuickHelpOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500/15 to-red-500/10 border border-rose-500/30 hover:border-rose-500 text-xs font-black text-rose-400 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>🚨</span>
              <span>Quick Help</span>
            </button>

            {/* Voice Settings */}
            <Link
              to="/patient/voice-settings"
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-teal-500/30 hover:border-teal-400 text-xs font-black text-teal-400 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Voice Settings</span>
            </Link>

            {/* Hydration 1-Tap */}
            <button
              type="button"
              onClick={handleAddHydration}
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-blue-500/30 hover:border-blue-400 text-xs font-black text-blue-400 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>💧</span>
              <span>{hydrationCount}/{hydrationTarget} Glasses</span>
            </button>

            {/* Routine Analytics */}
            <Link
              to="/patient/analytics"
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-indigo-500/30 hover:border-indigo-400 text-xs font-black text-indigo-400 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>📊</span>
              <span>Insights</span>
            </Link>

            {/* Demo Mode Button */}
            <button
              type="button"
              onClick={() => setIsInteractiveDemoOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400 text-xs font-black text-amber-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>DEMO MODE</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 2. SMART MISSED REMINDER ALERT (WHEN APPLICABLE) ───────────────── */}
      {missedReminders.length > 0 && (
        <MissedReminderBanner
          missedItems={missedReminders}
          onMarkComplete={handleMarkMissedComplete}
          onReschedule={handleRescheduleMissed}
          onDismiss={(id) => setMissedReminders((prev) => prev.filter((m) => m.id !== id))}
        />
      )}

      {/* ─── 3. SMART HOME DASHBOARD HEADER & TODAY'S PROGRESS SCORE ──────── */}
      <section className="card-3d p-6 sm:p-8 rounded-[28px] bg-gradient-to-br from-purple-950/40 via-[var(--card-bg-inline)] to-emerald-950/30 border-2 border-purple-400/30 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[var(--text-secondary)] font-mono">
                📅 {getFormattedDate()}
              </span>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-400/40 text-[10px] font-black px-2 py-0.2 rounded-full">
                ID: {patientId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
              {lang === 'mr'
                ? 'तुमच्या सर्व आरोग्य स्मरणपत्रांचे आणि दिनचर्येचे व्यवस्थापन.'
                : lang === 'hi'
                ? 'आपके सभी स्वास्थ्य अलार्म और दैनिक रूटीन का स्मार्ट सहायक।'
                : 'Your compassionate AI daily companion for health, routines, and voice reminders.'}
            </p>
          </div>

          {/* Today's Routine Score Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] min-w-[260px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Today's Routine
              </span>
              <span className="text-sm font-black text-emerald-300">
                {progressPct}% Completed
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)] pt-1">
              <span className="text-emerald-400">✓ Completed: {completedCount}</span>
              <span className="text-amber-300">⏳ Pending: {pendingCount}</span>
              <span className="text-teal-400">⏰ Total: {totalCount}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. NEXT UP WIDGET (CENTERPIECE LARGE CARD) ──────────────────────── */}
      <section className="card-3d p-6 sm:p-8 rounded-[28px] bg-gradient-to-r from-emerald-950/40 via-[var(--card-bg-inline)] to-teal-950/30 border-2 border-emerald-400/40 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                NEXT UP
              </span>
              <span className="text-xs font-black text-emerald-300 bg-[var(--bg-surface-secondary)] px-2.5 py-0.5 rounded-full">
                ⏰ {nextReminder.timeDisplay || '10:00 AM'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
              <span>💊</span> {nextReminder.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-emerald-300/90 font-medium">
              <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="italic">
                "{nextReminder.metadata?.voiceMessage || 'Medicine lene ka time ho gaya hai.'}"
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                const msg = nextReminder.metadata?.voiceMessage || nextReminder.title;
                speechService.speak(msg, nextReminder.metadata?.voiceLanguage || lang);
              }}
              className="btn-glass px-4 py-3 rounded-2xl text-xs font-black text-emerald-300 hover:text-emerald-200 flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Voice</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const doneId = routineTasks.find((t) => !t.completed)?.id;
                if (doneId) handleToggleRoutineTask(doneId);
              }}
              className="btn-glow px-5 py-3 rounded-2xl text-xs font-black text-white flex items-center gap-1.5 cursor-pointer shadow-xl"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 5. QUICK ACTIONS (5 LARGE 1-TAP ROUNDED CARDS) ────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
            {t('Quick Actions')}
          </h2>
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            Simple 1-Tap Controls
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Action 1: Add Reminder */}
          <Link
            to="/patient/reminders"
            className="p-5 rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border)] hover:border-teal-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
              ➕
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-teal-400 transition-colors">
                Add Reminder
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1">
                Set spoken alarms
              </p>
            </div>
          </Link>

          {/* Action 2: 🎤 Voice Reminder */}
          <button
            type="button"
            onClick={() => setIsVoiceToReminderOpen(true)}
            className="p-5 rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border)] hover:border-emerald-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
              🎤
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                Voice Reminder
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1">
                Say "Kal 8 baje..."
              </p>
            </div>
          </button>

          {/* Action 3: 📅 Today's Routine */}
          <a
            href="#routine"
            className="p-5 rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border)] hover:border-indigo-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
              📅
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">
                Today's Routine
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1">
                View & check tasks
              </p>
            </div>
          </a>

          {/* Action 4: ✨ Gemini AI Chat */}
          <Link
            to="/aabha"
            className="p-5 rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border)] hover:border-purple-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
              ✨
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-purple-400 transition-colors">
                Gemini AI Chat
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1">
                Ask AABHA (Gemini)
              </p>
            </div>
          </Link>

          {/* Action 5: 📊 Insights */}
          <Link
            to="/patient/analytics"
            className="p-5 rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border)] hover:border-amber-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none col-span-2 sm:col-span-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
              📊
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-amber-400 transition-colors">
                Insights
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1">
                Weekly progress
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── 6. AABHA SUGGESTIONS WIDGET ─────────────────────────────────────── */}
      <section>
        <AabhaSuggestionsWidget onLogHydration={handleAddHydration} />
      </section>

      {/* ─── 7. SIGNBRIDGE 2-WAY ISL DOCTOR CONSULTATION ────────────────────── */}
      <section className="card-3d p-5 sm:p-7 rounded-[28px] bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-teal-900/30 border-2 border-purple-400/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center justify-center text-3xl shrink-0 shadow-inner">
            🤟
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[10px] font-black uppercase tracking-wider">
                Two-Way ISL • SIH26003
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Indian Sign Language
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white">
              SignBridge – Sign Language Doctor Consultation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
              Real-time WebRTC 2-way ISL gesture translation, Text-to-Speech & subtitles with Dr. Anita Verma.
            </p>
          </div>
        </div>

        <Link
          to="/patient/signbridge"
          className="btn-glow w-full md:w-auto px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0 whitespace-nowrap"
        >
          <span>Start ISL Consultation →</span>
        </Link>
      </section>

      {/* ─── 8. TODAY'S ROUTINE TIMELINE ────────────────────────────────────── */}
      <section id="routine">
        <DailyRoutineTimeline
          tasks={routineTasks}
          onToggleTask={handleToggleRoutineTask}
          onAddTask={() => setIsVoiceToReminderOpen(true)}
        />
      </section>

      {/* ─── 9. FLOATING VOICE ASSISTANT & MODALS ───────────────────────────── */}
      <AbhaVoiceAssistant onTriggerSos={() => setIsSosOpen(true)} />

      {/* Voice-to-Reminder Modal */}
      <VoiceToReminderModal
        isOpen={isVoiceToReminderOpen}
        onClose={() => setIsVoiceToReminderOpen(false)}
        onReminderCreated={fetchReminders}
      />

      {/* Hackathon Interactive Demo Modal */}
      <HackathonInteractiveDemoModal
        isOpen={isInteractiveDemoOpen}
        onClose={() => setIsInteractiveDemoOpen(false)}
      />

      {/* Trusted Contact Quick Help Modal */}
      <TrustedContactQuickHelpModal
        isOpen={isQuickHelpOpen}
        onClose={() => setIsQuickHelpOpen(false)}
      />

      {/* Emergency SOS Confirmation Modal */}
      <ModalPortal isOpen={isSosOpen} onClose={() => { setIsSosOpen(false); setSosSent(false); }} maxWidth="max-w-md" showCloseButton={false}>
        <div className="text-center space-y-4 font-sans">
          <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center text-3xl mx-auto border border-rose-500/30 animate-bounce">
            🚨
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-rose-500">
            {sosSent ? t('Emergency SOS Sent!') : t('Confirm Emergency SOS?')}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
            {sosSent
              ? t('Your caregiver (Dr. Anita Verma) and emergency contacts have been notified with your live GPS location.')
              : t('This will notify your caregiver that you require immediate assistance.')}
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
      </ModalPortal>
    </div>
  );
};

export default PatientDashboard;

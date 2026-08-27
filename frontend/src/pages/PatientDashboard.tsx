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
import { speechService } from '../services/speechService';
import { useAlarm } from '../context/AlarmContext';
import { AdaptiveAIEngine, CognitivePerformanceIndicators } from '../services/adaptiveAIEngine';
import {
  Mic, Brain, Calendar, Pill, BookOpen, Droplets, CheckCircle2,
  Clock, Sparkles, ArrowRight, Copy, Check, Edit, Shield, Smile,
  AlertTriangle, RotateCcw, TrendingUp, Activity, Bot, Flame, Award,
  Zap, BarChart3, Volume2, Plus, ArrowUpRight
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { triggerVoiceAlarm, triggerDemoCountdown } = useAlarm();

  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  const [reminders, setReminders] = useState<any[]>([]);
  const [hydrationCount, setHydrationCount] = useState(4);
  const hydrationTarget = 6;

  // Visual Daily Routine Timeline Tasks
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>([
    { id: 'rt-1', time: '08:00 AM', timeMinutes: 480, title: 'Wake up & Drink Warm Water', category: 'HYDRATION', completed: true, voiceMessage: 'Subah uthkar ek glass garam paani piyein.' },
    { id: 'rt-2', time: '09:00 AM', timeMinutes: 540, title: 'Healthy Breakfast & Donepezil (5mg)', category: 'MEDICINE', completed: true, voiceMessage: 'Breakfast ke baad apni Donepezil 5mg dawa lijiye.' },
    { id: 'rt-3', time: '10:00 AM', timeMinutes: 600, title: 'Memory Match Brain Exercise', category: 'ACTIVITY', completed: true, voiceMessage: 'Aabha ke saath Level 2 Memory Match exercise ka time ho gaya hai.' },
    { id: 'rt-4', time: '01:00 PM', timeMinutes: 780, title: 'Nutritious Lunch & Memantine HCl', category: 'MEAL', completed: false, voiceMessage: 'Dopahar ke khane ke baad Memantine tablet lena na bhoolein.' },
    { id: 'rt-5', time: '02:00 PM', timeMinutes: 840, title: 'Afternoon Rest & Hydration', category: 'REST', completed: false, voiceMessage: 'Thoda vishram kijiye aur taaja paani pijiye.' },
    { id: 'rt-6', time: '06:00 PM', timeMinutes: 1080, title: 'Evening Walk in Garden & Tea', category: 'ACTIVITY', completed: false, voiceMessage: 'Shaam ki walk aur halki koshish ka time ho gaya hai.' },
    { id: 'rt-7', time: '08:00 PM', timeMinutes: 1200, title: 'Family Call with Priya & Study', category: 'FAMILY', completed: false, voiceMessage: 'Priya aur bachon se phone par baat karne ka samay ho gaya hai.' },
    { id: 'rt-8', time: '10:30 PM', timeMinutes: 1350, title: 'Mindful Box Breathing & Sleep', category: 'REST', completed: false, voiceMessage: 'Ache se aaram kijiye aur shanti se soiye.' }
  ]);

  const [missedReminders, setMissedReminders] = useState<MissedReminderItem[]>([]);
  const [indicators, setIndicators] = useState<CognitivePerformanceIndicators>(
    AdaptiveAIEngine.calculateCognitiveIndicators()
  );

  const [copiedId, setCopiedId] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  useEffect(() => {
    fetchReminders();
    setIndicators(AdaptiveAIEngine.calculateCognitiveIndicators());

    const handleUpdate = () => fetchReminders();
    window.addEventListener('aabha-reminders-updated', handleUpdate);
    return () => window.removeEventListener('aabha-reminders-updated', handleUpdate);
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders');
      if (Array.isArray(res)) {
        setReminders(res);

        // Check for missed reminders in the past few hours
        const now = new Date();
        const missed: MissedReminderItem[] = [];

        res.forEach(r => {
          if (r.status === 'ACTIVE' && r.scheduledAt) {
            const schedTime = new Date(r.scheduledAt);
            const diffMin = (now.getTime() - schedTime.getTime()) / (60 * 1000);
            if (diffMin > 10 && diffMin < 180) { // between 10m and 3h overdue
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
    setRoutineTasks(prev =>
      prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  };

  const handleMarkMissedComplete = async (id: string) => {
    setMissedReminders(prev => prev.filter(m => m.id !== id));
    try {
      await api.put(`/reminders/${id}`, { status: 'COMPLETED' });
      fetchReminders();
    } catch {}
  };

  const handleRescheduleMissed = async (id: string, minsFromNow: number) => {
    setMissedReminders(prev => prev.filter(m => m.id !== id));
    const newTime = new Date(Date.now() + minsFromNow * 60 * 1000).toISOString();
    try {
      await api.put(`/reminders/${id}`, { scheduledAt: newTime });
      fetchReminders();
    } catch {}
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

  const completedTasksCount = routineTasks.filter(t => t.completed).length;
  const totalTasksCount = routineTasks.length;
  const progressPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 80;

  const patientId = user?.patientId || 'PAT-DEMO-000001';
  const firstName = (user?.name || 'Mr. Arun Das');

  // Next Upcoming Reminder
  const nextReminder = reminders.find(r => r.status === 'ACTIVE') || {
    id: 'next-1',
    title: 'Donepezil & Hydration',
    scheduledAt: new Date(Date.now() + 1800000).toISOString(),
    metadata: {
      voiceMessage: 'Medicine lene ka time ho gaya hai. Donepezil 5mg le lijiye.',
      voiceLanguage: 'hi'
    }
  };

  const nextTimeStr = nextReminder.scheduledAt
    ? new Date(nextReminder.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '10:00 AM';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 font-sans text-[var(--text-primary)] pb-24">
      {/* ─── 1. TOP QUICK STATUS / ACTIONS BAR ─────────────────────────────── */}
      <section className="sticky top-[58px] sm:top-[68px] z-30 py-2 backdrop-blur-2xl bg-[var(--bg-page)]/90 border-b border-[var(--border)] -mx-3.5 px-3.5 sm:-mx-6 sm:px-6 transition-all">
        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5 min-w-[580px] lg:min-w-0">
            {/* Card 1: Emergency SOS */}
            <button
              type="button"
              onClick={() => setIsSosOpen(true)}
              className="p-3 sm:p-4 rounded-[20px] bg-gradient-to-br from-rose-500/15 to-red-500/10 border border-rose-500/30 hover:border-rose-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left group select-none"
            >
              <div>
                <div className="text-[10px] font-black uppercase text-rose-500 tracking-wider">
                  Emergency
                </div>
                <div className="text-xs sm:text-sm font-black text-[var(--text-primary)] mt-0.5">
                  1-Tap SOS
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-medium">
                  Caregiver alert
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform shrink-0">
                🚨
              </div>
            </button>

            {/* Card 2: Voice Alarms */}
            <Link
              to="/patient/reminders"
              className="p-3 sm:p-4 rounded-[20px] bg-[var(--bg-surface)] border border-teal-500/30 hover:border-teal-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left group select-none"
            >
              <div>
                <div className="text-[10px] font-black uppercase text-teal-500 tracking-wider">
                  Voice Alarms
                </div>
                <div className="text-xs sm:text-sm font-black text-[var(--text-primary)] mt-0.5">
                  {reminders.filter(r => r.status === 'ACTIVE').length} Active Alarms
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-medium">
                  Next: {nextTimeStr}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-500/15 text-teal-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform shrink-0">
                🗣️
              </div>
            </Link>

            {/* Card 3: Hydration Goal */}
            <button
              type="button"
              onClick={handleAddHydration}
              className="p-3 sm:p-4 rounded-[20px] bg-[var(--bg-surface)] border border-blue-500/30 hover:border-blue-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left group select-none"
            >
              <div>
                <div className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                  Hydration
                </div>
                <div className="text-xs sm:text-sm font-black text-[var(--text-primary)] mt-0.5">
                  {hydrationCount} / {hydrationTarget} Glasses
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-medium">
                  {hydrationCount >= hydrationTarget ? 'Goal met! 🎉' : '+1 Tap Log'}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform shrink-0">
                💧
              </div>
            </button>

            {/* Card 4: Routine Analytics */}
            <Link
              to="/patient/analytics"
              className="p-3 sm:p-4 rounded-[20px] bg-[var(--bg-surface)] border border-indigo-500/30 hover:border-indigo-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left group select-none"
            >
              <div>
                <div className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                  Analytics
                </div>
                <div className="text-xs sm:text-sm font-black text-[var(--text-primary)] mt-0.5">
                  6-Day Streak 🔥
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-medium">
                  89% Consistency
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform shrink-0">
                📊
              </div>
            </Link>

            {/* Card 5: Demo Mode */}
            <button
              type="button"
              onClick={() => triggerDemoCountdown()}
              className="p-3 sm:p-4 rounded-[20px] bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-400/40 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left group select-none col-span-2 sm:col-span-1"
            >
              <div>
                <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 animate-bounce" /> Demo Mode
                </div>
                <div className="text-xs sm:text-sm font-black text-[var(--text-primary)] mt-0.5">
                  10s Voice Alarm
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-medium">
                  Test Live Demo
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform shrink-0">
                ⚡
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 2. SMART MISSED REMINDER ALERT (IF ANY) ────────────────────────── */}
      {missedReminders.length > 0 && (
        <MissedReminderBanner
          missedItems={missedReminders}
          onMarkComplete={handleMarkMissedComplete}
          onReschedule={handleRescheduleMissed}
          onDismiss={(id) => setMissedReminders(prev => prev.filter(m => m.id !== id))}
        />
      )}

      {/* ─── 3. HERO GREETING, DATE & TODAY'S PROGRESS BAR ─────────────────── */}
      <section className="card-3d p-6 sm:p-8 rounded-[28px] bg-gradient-to-br from-emerald-950/40 via-[var(--card-bg-inline)] to-teal-950/30 border-2 border-emerald-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text-secondary)] px-3 py-1 rounded-full shadow-inner flex items-center gap-1.5">
                <span>📅 {getFormattedDate()}</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                ID: {patientId}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">
              {getGreeting()}, {firstName.split(' ')[0]}! 👋
            </h1>
            <p className="text-xs sm:text-base text-[var(--text-secondary)] font-medium max-w-xl">
              {lang === 'mr'
                ? 'तुमची आजची दिनचर्या, बोलणारे स्मरणपत्र आणि आरोग्य ट्रॅकर तयार आहे.'
                : lang === 'hi'
                ? 'आपकी आज की दिनचर्या, वॉयस अलार्म और स्वास्थ्य ट्रैकर तैयार है।'
                : 'Your daily routine, spoken voice reminders, and health companions are ready.'}
            </p>
          </div>

          {/* Next Reminder Card Spotlight */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface-secondary)] border-2 border-emerald-400/40 shadow-xl space-y-3 min-w-[280px] sm:min-w-[320px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Next Up Today
              </span>
              <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                {nextTimeStr}
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>💊</span> {nextReminder.title}
              </h3>
              {nextReminder.metadata?.voiceMessage && (
                <p className="text-xs text-emerald-300/90 italic mt-1 font-medium">
                  "{nextReminder.metadata.voiceMessage}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const msg = nextReminder.metadata?.voiceMessage || nextReminder.title;
                  speechService.speak(msg, nextReminder.metadata?.voiceLanguage || lang);
                }}
                className="btn-glass flex-1 py-2 text-xs font-bold text-emerald-300 hover:text-emerald-200 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> Test Voice
              </button>

              <Link
                to="/patient/reminders"
                className="btn-glow flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1 text-white shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> View Alarms
              </Link>
            </div>
          </div>
        </div>

        {/* Today's Overall Progress Bar */}
        <div className="pt-2 border-t border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'mr' ? 'आजच्या दिनचर्येची प्रगती' : lang === 'hi' ? 'आज के रूटीन की प्रगति' : "Today's Routine Progress"}</span>
            </span>
            <span className="text-emerald-400 font-black text-sm">
              {progressPct}% ({completedTasksCount}/{totalTasksCount} {lang === 'mr' ? 'पूर्ण' : lang === 'hi' ? 'कार्य पूरे' : 'Done'})
            </span>
          </div>

          <div className="w-full h-3.5 rounded-full bg-[var(--bg-surface-secondary)] border border-[var(--border)] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-500 shadow-md"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </section>

      {/* ─── 4. SIGNBRIDGE ISL DOCTOR CONSULTATION HERO ─────────────────────── */}
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

      {/* ─── 5. VISUAL DAILY ROUTINE TIMELINE (MORNING, AFTERNOON, EVENING, NIGHT) */}
      <section id="routine">
        <DailyRoutineTimeline
          tasks={routineTasks}
          onToggleTask={handleToggleRoutineTask}
          onAddTask={() => navigate('/patient/reminders')}
        />
      </section>

      {/* ─── 6. FLOATING MULTI-LINGUAL VOICE ASSISTANT ──────────────────────── */}
      <AbhaVoiceAssistant onTriggerSos={() => setIsSosOpen(true)} />

      {/* ─── 7. EMERGENCY SOS CONFIRMATION MODAL ─────────────────────────────── */}
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

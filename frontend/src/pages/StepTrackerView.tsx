import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Footprints,
  ArrowLeft,
  Flame,
  Clock,
  Compass,
  Plus,
  Play,
  Pause,
  Volume2,
  TrendingUp,
  Award,
  Sparkles,
  ShieldCheck,
  Heart,
  Droplet,
  Calendar,
  Settings2,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
  Zap
} from 'lucide-react';
import { stepTrackingService, StepRecord, StepHistorySummary } from '../services/stepTrackingService';
import { useAuthStore } from '../stores/authStore';

export const StepTrackerView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();

  const [summary, setSummary] = useState<StepHistorySummary>(stepTrackingService.getWeeklySummary());
  const [record, setRecord] = useState<StepRecord>(summary.today);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(stepTrackingService.isTrackingActive());
  const [sensorStatusMsg, setSensorStatusMsg] = useState<string>('');
  const [justAddedStep, setJustAddedStep] = useState<boolean>(false);

  // Modal States
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalInput, setNewGoalInput] = useState(record.goal || 4000);
  const [showCustomAddModal, setShowCustomAddModal] = useState(false);
  const [customStepsInput, setCustomStepsInput] = useState('500');
  const [customActivityType, setCustomActivityType] = useState('Garden Walk');

  useEffect(() => {
    const refreshData = () => {
      const s = stepTrackingService.getWeeklySummary();
      setSummary(s);
      setRecord(s.today);
      setIsLiveActive(stepTrackingService.isTrackingActive());
    };

    window.addEventListener('aabha-steps-updated', refreshData);
    return () => window.removeEventListener('aabha-steps-updated', refreshData);
  }, []);

  const progressPercent = Math.min(100, Math.round((record.steps / (record.goal || 4000)) * 100));
  const circumference = 2 * Math.PI * 68;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleQuickAdd = (count: number, label = 'Quick Add') => {
    const updated = stepTrackingService.addSteps(count, label);
    setRecord(updated);
    setSummary(stepTrackingService.getWeeklySummary());
    setJustAddedStep(true);
    setTimeout(() => setJustAddedStep(false), 1000);
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(customStepsInput, 10);
    if (!isNaN(count) && count > 0) {
      handleQuickAdd(count, customActivityType);
      setShowCustomAddModal(false);
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const g = Number(newGoalInput);
    if (g >= 500 && g <= 20000) {
      const updated = stepTrackingService.setDailyGoal(g);
      setRecord(updated);
      setSummary(stepTrackingService.getWeeklySummary());
      setShowGoalModal(false);
    }
  };

  const handleToggleLivePedometer = async () => {
    if (isLiveActive) {
      stepTrackingService.stopLiveTracking();
      setIsLiveActive(false);
      setSensorStatusMsg('Live pedometer paused.');
      setTimeout(() => setSensorStatusMsg(''), 3000);
    } else {
      const res = await stepTrackingService.startLiveTracking((updated) => {
        setRecord(updated);
        setSummary(stepTrackingService.getWeeklySummary());
        setJustAddedStep(true);
        setTimeout(() => setJustAddedStep(false), 600);
      });
      setIsLiveActive(res.success);
      setSensorStatusMsg(res.message);
      setTimeout(() => setSensorStatusMsg(''), 4000);
    }
  };

  const handleSpeakStatus = () => {
    const lang = (i18n.language || 'en').startsWith('mr') ? 'mr' : (i18n.language || 'en').startsWith('hi') ? 'hi' : 'en';
    stepTrackingService.speakStepStatus(lang);
  };

  // Day names helper
  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString([], { weekday: 'short' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans">
      {/* ─── Top Header Navigation ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <Link
            to="/patient"
            className="p-2.5 rounded-2xl bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 text-[var(--text-secondary)] hover:text-emerald-400 border border-[var(--border)] transition-all shadow-xs"
            aria-label="Back to Patient Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {t('Physical Step & Mobility Tracker')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Aabha Vitality
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              {t('Track daily walking strides, movement milestones, and senior physical mobility')}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSpeakStatus}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 text-emerald-400 border border-[var(--border)] transition-all flex items-center gap-2 shadow-xs"
            title={t('Listen to Step Count Status')}
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t('Voice Summary')}</span>
          </button>

          <button
            onClick={() => {
              setNewGoalInput(record.goal);
              setShowGoalModal(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 text-[var(--text-primary)] border border-[var(--border)] transition-all flex items-center gap-2 shadow-xs"
          >
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <span>{t('Change Goal')}</span>
          </button>

          <button
            onClick={() => setShowCustomAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{t('Log Activity')}</span>
          </button>
        </div>
      </div>

      {/* ─── Hero Section: Main Circular Gauge & Key 4 Metrics ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Big Circular Gauge Card */}
        <div
          className="lg:col-span-5 rounded-3xl p-6 sm:p-8 border border-emerald-500/20 backdrop-blur-xl relative overflow-hidden flex flex-col items-center justify-between shadow-xl"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Footprints className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {t("Today's Progress")}
              </span>
            </div>
            {isLiveActive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Sensor Active
              </span>
            )}
          </div>

          {/* SVG Circular Progress Meter */}
          <div className="relative w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Outer Background Track */}
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="12"
                className="text-[var(--bg-surface-secondary)] opacity-60"
              />
              {/* Inner Active Gradient Stroke */}
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="transparent"
                stroke="url(#heroStepGradient)"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="heroStepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="60%" stopColor="#14B8A6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Center Dial */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className={`text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight transition-transform duration-300 ${justAddedStep ? 'scale-110 text-emerald-400' : ''}`}>
                {record.steps.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mt-1">
                {t('Goal')}: {record.goal.toLocaleString()}
              </span>
              <span className="mt-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {progressPercent}% {t('Met')}
              </span>
            </div>
          </div>

          {/* Bottom Live Toggle Button */}
          <div className="w-full mt-4 flex flex-col gap-2">
            <button
              onClick={handleToggleLivePedometer}
              className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                isLiveActive
                  ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/25'
              }`}
            >
              {isLiveActive ? (
                <>
                  <Pause className="w-4 h-4" /> {t('Pause Live Pedometer')}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> {t('Start Live Motion Pedometer')}
                </>
              )}
            </button>
            {sensorStatusMsg && (
              <p className="text-[11px] text-emerald-400 text-center font-medium">
                {sensorStatusMsg}
              </p>
            )}
          </div>
        </div>

        {/* Right 4 Metric Tiles & Quick Add Bar */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          {/* 4 Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* 1. Distance */}
            <div
              className="rounded-3xl p-5 border border-[var(--border)] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden transition-all hover:border-teal-500/40"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {t('Distance')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center shadow-xs">
                  <Compass className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-[var(--text-primary)]">
                  {record.distanceKm}
                </span>
                <span className="text-sm font-semibold text-[var(--text-secondary)] ml-1.5">km</span>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1">
                  ~{(record.distanceKm * 0.621371).toFixed(2)} miles walked
                </p>
              </div>
            </div>

            {/* 2. Calories */}
            <div
              className="rounded-3xl p-5 border border-[var(--border)] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden transition-all hover:border-amber-500/40"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {t('Calories')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shadow-xs">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-[var(--text-primary)]">
                  {record.caloriesKcal}
                </span>
                <span className="text-sm font-semibold text-[var(--text-secondary)] ml-1.5">kcal</span>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1">
                  Active movement energy
                </p>
              </div>
            </div>

            {/* 3. Active Walking Time */}
            <div
              className="rounded-3xl p-5 border border-[var(--border)] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden transition-all hover:border-indigo-500/40"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {t('Active Time')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-[var(--text-primary)]">
                  {record.activeMinutes}
                </span>
                <span className="text-sm font-semibold text-[var(--text-secondary)] ml-1.5">minutes</span>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1">
                  Moderate paced walking
                </p>
              </div>
            </div>

            {/* 4. Active Streak */}
            <div
              className="rounded-3xl p-5 border border-[var(--border)] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden transition-all hover:border-purple-500/40"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {t('Activity Streak')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-[var(--text-primary)]">
                  {summary.streakDays}
                </span>
                <span className="text-sm font-semibold text-[var(--text-secondary)] ml-1.5">days</span>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1">
                  Consistent daily movement
                </p>
              </div>
            </div>
          </div>

          {/* Quick Increment Bar */}
          <div
            className="rounded-3xl p-5 border border-[var(--border)] backdrop-blur-xl"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" /> {t('Quick Step Logger')}
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Add completed walking strides with 1-click
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              <button
                onClick={() => handleQuickAdd(250, 'Short Garden Walk')}
                className="py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 hover:text-emerald-400 border border-[var(--border)] transition-all text-center"
              >
                +250
              </button>
              <button
                onClick={() => handleQuickAdd(500, 'Morning Stroll')}
                className="py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 hover:text-emerald-400 border border-[var(--border)] transition-all text-center"
              >
                +500
              </button>
              <button
                onClick={() => handleQuickAdd(1000, 'Brisk Park Walk')}
                className="py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 hover:text-emerald-400 border border-[var(--border)] transition-all text-center"
              >
                +1,000
              </button>
              <button
                onClick={() => handleQuickAdd(2000, 'Evening Walk Session')}
                className="py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 hover:text-emerald-400 border border-[var(--border)] transition-all text-center"
              >
                +2,000
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 7-Day Walking History & Hourly Charts ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Weekly 7-Day History Chart */}
        <div
          className="lg:col-span-7 rounded-3xl p-6 sm:p-7 border border-[var(--border)] backdrop-blur-xl shadow-lg"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                {t('7-Day Walking Activity')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {t('Weekly Total')}: <span className="font-bold text-emerald-400">{summary.weeklyTotalSteps.toLocaleString()}</span> {t('steps')} ({summary.weeklyTotalKm} km)
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Avg {summary.averageSteps.toLocaleString()} / day
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2">
            {summary.history.map((day, idx) => {
              const heightPercent = Math.min(100, Math.max(12, Math.round((day.steps / (day.goal || 4000)) * 100)));
              const isToday = day.date === record.date;
              const metGoal = day.steps >= day.goal;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Step Tooltip */}
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.steps}
                  </span>

                  {/* Visual Bar */}
                  <div className="w-full max-w-[36px] bg-[var(--bg-surface-secondary)] h-full rounded-2xl p-1 flex items-end">
                    <div
                      className={`w-full rounded-xl transition-all duration-700 ease-out ${
                        isToday
                          ? 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                          : metGoal
                          ? 'bg-gradient-to-t from-teal-500 to-cyan-400'
                          : 'bg-gradient-to-t from-slate-500/40 to-slate-400/40'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={`text-xs font-bold ${isToday ? 'text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
                    {getDayLabel(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Senior Health Mobility Guide & Caregiver Link */}
        <div
          className="lg:col-span-5 rounded-3xl p-6 sm:p-7 border border-[var(--border)] backdrop-blur-xl shadow-lg flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              {t('Senior Mobility & Walking Safety')}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              {t('Regular gentle walking boosts memory blood flow and promotes sound sleep')}
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-start gap-3">
                <Droplet className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-primary)]">Hydration Reminder</h5>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Drink a glass of warm water before and after your walk.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-start gap-3">
                <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-primary)]">Gentle Pacing</h5>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Aim for steady 15-20 minute strolls in comfortable walking shoes.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-primary)]">Caregiver Live Sync</h5>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Your daily walking milestones are shared automatically with your caregiver.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Patient ID: <strong className="text-[var(--text-primary)]">{user?.patientId || 'PAT-2026-000001'}</strong></span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Synced
            </span>
          </div>
        </div>
      </div>

      {/* ─── Goal Setting Modal ───────────────────────────────────────────── */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl p-6 border border-[var(--border)] shadow-2xl animate-in fade-in zoom-in duration-200"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">
              {t('Set Daily Step Goal')}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Choose a comfortable daily target. 3,000 to 5,000 steps are recommended for seniors.
            </p>

            <form onSubmit={handleSaveGoal}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    {t('Target Steps Per Day')}
                  </label>
                  <input
                    type="number"
                    min="500"
                    max="20000"
                    step="250"
                    value={newGoalInput}
                    onChange={(e) => setNewGoalInput(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-3 rounded-2xl text-lg font-bold bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Preset Choices */}
                <div className="grid grid-cols-3 gap-2">
                  {[3000, 4000, 6000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewGoalInput(preset)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        newGoalInput === preset
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] border-[var(--border)]'
                      }`}
                    >
                      {preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-all"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-500/20"
                >
                  {t('Save Goal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Custom Activity Logger Modal ─────────────────────────────────── */}
      {showCustomAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl p-6 border border-[var(--border)] shadow-2xl animate-in fade-in zoom-in duration-200"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">
              {t('Log Physical Walking Activity')}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Record completed steps from your outdoor walk or physiotherapy session.
            </p>

            <form onSubmit={handleCustomAdd}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    {t('Activity Type')}
                  </label>
                  <select
                    value={customActivityType}
                    onChange={(e) => setCustomActivityType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-semibold bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Garden Walk">🌸 Garden Walk</option>
                    <option value="Morning Stroll">🌅 Morning Stroll</option>
                    <option value="Evening Walk">🌇 Evening Walk</option>
                    <option value="Physiotherapy Exercise">🤸 Physiotherapy Movement</option>
                    <option value="Indoor Corridor Walk">🏠 Indoor Walking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    {t('Number of Steps')}
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    step="50"
                    value={customStepsInput}
                    onChange={(e) => setCustomStepsInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-lg font-bold bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCustomAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-all"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-500/20"
                >
                  {t('Log Steps')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepTrackerView;

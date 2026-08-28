import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Footprints,
  Flame,
  Clock,
  Compass,
  Plus,
  Play,
  Pause,
  Volume2,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  HeartPulse,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { stepTrackingService, StepRecord } from '../services/stepTrackingService';

interface StepCounterWidgetProps {
  compact?: boolean;
  showQuickAdd?: boolean;
  showLiveSensorToggle?: boolean;
  className?: string;
}

export const StepCounterWidget: React.FC<StepCounterWidgetProps> = ({
  compact = false,
  showQuickAdd = true,
  showLiveSensorToggle = true,
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const [record, setRecord] = useState<StepRecord>(stepTrackingService.getTodayRecord());
  const [isLiveActive, setIsLiveActive] = useState<boolean>(stepTrackingService.isTrackingActive());
  const [sensorStatusMsg, setSensorStatusMsg] = useState<string>('');
  const [justAddedStep, setJustAddedStep] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setRecord(stepTrackingService.getTodayRecord());
      setIsLiveActive(stepTrackingService.isTrackingActive());
    };

    window.addEventListener('aabha-steps-updated', handleUpdate);
    return () => window.removeEventListener('aabha-steps-updated', handleUpdate);
  }, []);

  const progressPercent = Math.min(100, Math.round((record.steps / (record.goal || 4000)) * 100));

  const handleQuickAdd = (count: number) => {
    const updated = stepTrackingService.addSteps(count, 'Manual Entry');
    setRecord(updated);
    setJustAddedStep(true);
    setTimeout(() => setJustAddedStep(false), 1200);
  };

  const handleToggleLivePedometer = async () => {
    if (isLiveActive) {
      stepTrackingService.stopLiveTracking();
      setIsLiveActive(false);
      setSensorStatusMsg('Live Pedometer paused');
      setTimeout(() => setSensorStatusMsg(''), 3000);
    } else {
      const res = await stepTrackingService.startLiveTracking((updated) => {
        setRecord(updated);
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

  // Compact Mode (for smaller summary widgets)
  if (compact) {
    return (
      <div
        className={`rounded-2xl p-4 sm:p-5 border border-emerald-500/20 backdrop-blur-md relative overflow-hidden transition-all hover:border-emerald-500/40 ${className}`}
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                {t('Daily Step Counter')}
                {isLiveActive && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {progressPercent}% {t('of')} {record.goal.toLocaleString()} {t('steps goal')}
              </p>
            </div>
          </div>
          <Link
            to="/patient/steps"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors"
          >
            {t('View')} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-black text-emerald-400 transition-transform ${justAddedStep ? 'scale-110' : ''}`}>
              {record.steps.toLocaleString()}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">{t('steps')}</span>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {record.distanceKm} km
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--bg-surface-secondary)] h-2.5 rounded-full overflow-hidden mb-3.5">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Increment Buttons */}
        {showQuickAdd && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleQuickAdd(250)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 hover:text-emerald-400 border border-[var(--border)] transition-all text-center"
            >
              +250
            </button>
            <button
              onClick={() => handleQuickAdd(500)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 hover:text-emerald-400 border border-[var(--border)] transition-all text-center"
            >
              +500
            </button>
            <button
              onClick={() => handleQuickAdd(1000)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 hover:text-emerald-400 border border-[var(--border)] transition-all text-center"
            >
              +1,000
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full Rich Widget Mode
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      className={`rounded-3xl p-5 sm:p-7 border border-emerald-500/20 backdrop-blur-xl relative overflow-hidden transition-all shadow-xl hover:border-emerald-500/40 ${className}`}
      style={{ backgroundColor: 'var(--bg-surface)' }}
    >
      {/* Background Decorative Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Footprints className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
              {t('Physical Activity & Step Counter')}
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {t('Gentle daily walking tracker for vitality and cognitive wellness')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Announcement Button */}
          <button
            onClick={handleSpeakStatus}
            className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 text-emerald-400 border border-[var(--border)] transition-all shadow-xs"
            title={t('Listen to Step Count Status')}
            aria-label="Speak step count"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Link to Full Page */}
          <Link
            to="/patient/steps"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1.5"
          >
            {t('Full Tracker')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Circular Dial & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6 relative z-10">
        {/* Left: Circular Step Ring */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Ring */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                className="text-[var(--bg-surface-secondary)]"
              />
              {/* Animated Progress Gradient Ring */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="transparent"
                stroke="url(#stepGradient)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="stepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#14B8A6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className={`text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight transition-transform duration-300 ${justAddedStep ? 'scale-110 text-emerald-400' : ''}`}>
                {record.steps.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">
                {t('of')} {record.goal.toLocaleString()} {t('steps')}
              </span>
              <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {progressPercent}% {t('Completed')}
              </span>
            </div>
          </div>

          {progressPercent >= 100 ? (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              <Award className="w-4 h-4 text-amber-400" /> {t('Daily Walking Goal Achieved!')}
            </div>
          ) : (
            <p className="mt-2.5 text-xs text-[var(--text-secondary)] font-medium text-center">
              {(record.goal - record.steps).toLocaleString()} {t('more steps to reach your goal')}
            </p>
          )}
        </div>

        {/* Right: 3 Key Vital Metrics */}
        <div className="md:col-span-7 grid grid-cols-3 gap-3">
          {/* Distance */}
          <div className="rounded-2xl p-3.5 border border-[var(--border)] bg-[var(--bg-surface-secondary)]/50 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-2">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xl font-black text-[var(--text-primary)]">
                {record.distanceKm}
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-medium ml-1">km</span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
              {t('Distance Walked')}
            </span>
          </div>

          {/* Calories */}
          <div className="rounded-2xl p-3.5 border border-[var(--border)] bg-[var(--bg-surface-secondary)]/50 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xl font-black text-[var(--text-primary)]">
                {record.caloriesKcal}
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-medium ml-1">kcal</span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
              {t('Calories Burned')}
            </span>
          </div>

          {/* Active Time */}
          <div className="rounded-2xl p-3.5 border border-[var(--border)] bg-[var(--bg-surface-secondary)]/50 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xl font-black text-[var(--text-primary)]">
                {record.activeMinutes}
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-medium ml-1">mins</span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
              {t('Active Time')}
            </span>
          </div>
        </div>
      </div>

      {/* Sensor Message Notice if any */}
      {sensorStatusMsg && (
        <div className="mb-4 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          {sensorStatusMsg}
        </div>
      )}

      {/* Controls & Quick Add Buttons */}
      <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        {/* Automatic Live Tracking Status & Simulator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{t('Auto Sensor Active (Live)')}</span>
          </span>
        </div>

        {/* Quick Increment Adders */}
        {showQuickAdd && (
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-[var(--text-secondary)] font-semibold hidden md:inline mr-1">
              {t('Quick Log')}:
            </span>
            <button
              onClick={() => handleQuickAdd(250)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 hover:text-emerald-400 border border-[var(--border)] transition-all"
            >
              +250
            </button>
            <button
              onClick={() => handleQuickAdd(500)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 hover:text-emerald-400 border border-[var(--border)] transition-all"
            >
              +500
            </button>
            <button
              onClick={() => handleQuickAdd(1000)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 hover:text-emerald-400 border border-[var(--border)] transition-all"
            >
              +1,000
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepCounterWidget;

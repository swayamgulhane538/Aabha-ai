import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Sparkles,
  Bot,
  Mic,
  Brain,
  ShieldAlert,
  Wifi,
  WifiOff,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  Clock,
  Shield,
  Volume2
} from 'lucide-react';
import { Abha3DOrb } from './Abha3DOrb';

interface StageConfig {
  id: number;
  startSec: number;
  endSec: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
}

const STAGES: StageConfig[] = [
  { id: 1, startSec: 0, endSec: 7, title: 'Patient Profile & Daily Companion', subtitle: 'Meet Mr. Arun Das (PAT-DEMO-000001)', badge: '01. PATIENT DASHBOARD', icon: '👵' },
  { id: 2, startSec: 7, endSec: 14, title: 'Zero-Hallucination Voice Assistant', subtitle: 'Querying: "What is my routine today?"', badge: '02. VOICE COMPANION', icon: '🎤' },
  { id: 3, startSec: 14, endSec: 25, title: 'Cognitive Activity & Memory Exercise', subtitle: 'Playing Memory Match (Level 2) with real-time latency tracking', badge: '03. COGNITIVE GAME', icon: '🎴' },
  { id: 4, startSec: 25, endSec: 35, title: 'Adaptive AI Difficulty & Personalization', subtitle: 'Score 85% > 80% Threshold ➔ Level adapted to Level 3', badge: '04. ADAPTIVE AI ENGINE', icon: '🧠' },
  { id: 5, startSec: 35, endSec: 45, title: 'Caregiver Portal & 4-Pillar Analytics', subtitle: 'Memory: 82% | Attention: 76% | Speed: 1.8s | Consistency: 84%', badge: '05. CAREGIVER METRICS', icon: '📊' },
  { id: 6, startSec: 45, endSec: 52, title: 'Smart Alerts & Threshold Monitoring', subtitle: 'Simulated Demo Alert: Missed afternoon dose ➔ Priority Alert', badge: '06. SMART ALERTS', icon: '🚨' },
  { id: 7, startSec: 52, endSec: 57, title: 'Offline-First Vault & Auto Sync', subtitle: 'Local SQLite/IndexedDB queue ➔ Auto-synced on reconnect', badge: '07. OFFLINE SYNC', icon: '📡' },
  { id: 8, startSec: 57, endSec: 60, title: 'AABHA AI — SIH26003 Product Vision', subtitle: 'Supporting memory. Empowering independence. Connecting caregivers.', badge: '08. SUMMARY', icon: '🏆' }
];

interface OneMinuteDemoExperienceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OneMinuteDemoExperience: React.FC<OneMinuteDemoExperienceProps> = ({
  isOpen,
  onClose
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const totalSeconds = 60;
  const timerRef = useRef<any>(null);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSeconds(0);
      setIsPlaying(true);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 60-Second Timer
  useEffect(() => {
    if (isOpen && isPlaying) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return totalSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isOpen, isPlaying]);

  if (!isOpen || typeof document === 'undefined') return null;

  const currentStage =
    STAGES.find(s => seconds >= s.startSec && seconds < s.endSec) ||
    STAGES[STAGES.length - 1];

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRestart = () => {
    setSeconds(0);
    setIsPlaying(true);
  };

  const handleJumpToStage = (startSec: number) => {
    setSeconds(startSec);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in font-sans select-none overflow-hidden"
    >
      <div className="relative w-full max-w-4xl bg-[var(--bg-surface)] rounded-[28px] sm:rounded-[36px] border border-[var(--border)] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-modal-in text-[var(--text-primary)]">
        {/* ─── TOP PRESENTATION BAR ────────────────────────────────────────── */}
        <div className="px-5 sm:px-8 py-3.5 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-teal-400 p-0.5 animate-spin-slow">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-xs">
                ✨
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-purple-300 to-teal-300 bg-clip-text text-transparent">
                  DEMO MODE • SIH26003
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Simulated Demo Data
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Automated 1-Minute Comprehensive Product Journey
              </div>
            </div>
          </div>

          {/* Controls: Timer + Play/Pause + Restart + Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15 font-mono text-xs sm:text-sm font-black text-emerald-400">
              {formatTime(seconds)} / 01:00
            </div>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
              title={isPlaying ? 'Pause Demo' : 'Resume Demo'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
              title="Restart 1-Minute Demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer border border-rose-500/30 ml-1"
              title="Exit Demo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── PROGRESS BAR & STAGE STEPPER ────────────────────────────────── */}
        <div className="bg-[var(--bg-surface-secondary)] px-5 sm:px-8 py-2.5 border-b border-[var(--border)] space-y-2 shrink-0">
          {/* Continuous Progress Line */}
          <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 h-full transition-all duration-300"
              style={{ width: `${(seconds / totalSeconds) * 100}%` }}
            />
          </div>

          {/* Stepper Pills */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
            {STAGES.map(s => {
              const isCurrent = s.id === currentStage.id;
              const isPassed = seconds >= s.endSec;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleJumpToStage(s.startSec)}
                  className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm scale-105'
                      : isPassed
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-400/30'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-purple-400'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span className="hidden sm:inline">{s.badge.split('.')[1]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── DYNAMIC STAGE CONTENT CONTAINER ─────────────────────────────── */}
        <div className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-6">
          {/* Header for Current Stage */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-400/30">
                {currentStage.badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-2">
                {currentStage.title}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-0.5">
                {currentStage.subtitle}
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 self-start sm:self-center">
              Sec {currentStage.startSec}s – {currentStage.endSec}s
            </div>
          </div>

          {/* ─── STAGE 1 (0–7s): PATIENT DASHBOARD ─────────────────────────── */}
          {currentStage.id === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-teal-500/10 border border-purple-400/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-[var(--text-secondary)] font-bold">
                    Patient ID: PAT-DEMO-000001 (Fictional Demo)
                  </div>
                  <h3 className="text-2xl font-black text-[var(--text-primary)] mt-1">
                    Good Morning, Arun! 👋
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Large elderly-friendly touch targets with high-contrast accessibility.
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl shadow-lg">
                  🎤
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-center">
                  <span className="text-xl">🚨</span>
                  <div className="text-xs font-black mt-1">Emergency SOS</div>
                  <div className="text-[10px] text-rose-500 font-bold">1-Tap GPS Alert</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-center">
                  <span className="text-xl">💊</span>
                  <div className="text-xs font-black mt-1">Today's Medicine</div>
                  <div className="text-[10px] text-teal-500 font-bold">2/3 Taken (01:00 PM)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-center">
                  <span className="text-xl">💧</span>
                  <div className="text-xs font-black mt-1">Hydration Log</div>
                  <div className="text-[10px] text-blue-500 font-bold">4/6 Glasses Done</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-center">
                  <span className="text-xl">📅</span>
                  <div className="text-xs font-black mt-1">Daily Routine</div>
                  <div className="text-[10px] text-indigo-500 font-bold">5/7 Tasks Checked</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STAGE 2 (7–14s): VOICE ASSISTANT ──────────────────────────── */}
          {currentStage.id === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Abha3DOrb size="sm" state="SPEAKING" interactive={false} />
                    <span className="text-sm font-black">AABHA Voice Companion (Multi-Lingual)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-600 dark:text-purple-300">
                    Zero Hallucination
                  </span>
                </div>

                {/* Simulated Conversation */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-purple-600 text-white max-w-sm ml-auto text-right font-bold">
                    🗣️ "What is my routine today, Aabha?"
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] max-w-md text-left font-medium leading-relaxed shadow-sm">
                    🤖 "Good morning Arun ji! You have finished breakfast and Donepezil (5mg). Your next lunch & Memantine dose is at 01:00 PM, followed by an evening walk at 05:00 PM."
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] text-center font-mono">
                Speech recognition resolves structured local database intents without hallucinating personal health facts.
              </div>
            </div>
          )}

          {/* ─── STAGE 3 (14–25s): COGNITIVE GAME ──────────────────────────── */}
          {currentStage.id === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎴</span>
                  <div>
                    <div className="text-sm font-black">Memory Match (Exercise 1 of 6)</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">Pair matching with spatial recall</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono font-bold">
                  <span className="text-emerald-500">Accuracy: 85%</span>
                  <span className="text-purple-500">Latency: 1.8s</span>
                </div>
              </div>

              {/* Sample Card Grid Preview */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
                {[
                  { icon: '🍎', flipped: true, matched: true },
                  { icon: '🍎', flipped: true, matched: true },
                  { icon: '🌸', flipped: true, matched: false },
                  { icon: '❓', flipped: false, matched: false },
                  { icon: '🔔', flipped: true, matched: true },
                  { icon: '🔔', flipped: true, matched: true },
                  { icon: '🕊️', flipped: false, matched: false },
                  { icon: '🌸', flipped: true, matched: false }
                ].map((c, i) => (
                  <div
                    key={i}
                    className={`h-16 sm:h-20 rounded-xl border flex items-center justify-center text-2xl font-black transition-all ${
                      c.matched
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-600'
                        : c.flipped
                        ? 'bg-purple-500/20 border-purple-400'
                        : 'bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    {c.flipped ? c.icon : '✨'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── STAGE 4 (25–35s): ADAPTIVE AI ENGINE ──────────────────────── */}
          {currentStage.id === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-emerald-500 animate-pulse" />
                    <span className="text-sm font-black uppercase">Adaptive Performance Evaluation</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-600">
                    Difficulty Scale: Level 3 (Adaptive)
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  "Composite score of <strong>85%</strong> exceeds the 80% baseline threshold. Dynamic difficulty scaled from Level 2 to Level 3. Grid expanded to 4×4 with subtle distraction elements."
                </p>

                {/* Recommended Next Action */}
                <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span>✨ Next Recommended Activity:</span>
                    <strong className="text-purple-600 dark:text-purple-400">Daily Routine Ordering</strong>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-500">Auto Tailored ✓</span>
                </div>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] text-center">
                Non-diagnostic cognitive evaluation designed for engagement tracking and progression scaling.
              </div>
            </div>
          )}

          {/* ─── STAGE 5 (35–45s): CAREGIVER DASHBOARD ─────────────────────── */}
          {currentStage.id === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-sm font-black">Caregiver Monitoring: Dr. Anita Verma</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Patient: Mr. Arun Das • 4-Pillar Non-Medical Analytics</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-emerald-500/15 text-emerald-500 border border-emerald-400/30">
                  Overall Activity Index: 80%
                </span>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] uppercase font-black text-[var(--text-secondary)]">Memory Score</div>
                  <div className="text-xl font-black text-emerald-500 mt-1">82%</div>
                  <div className="text-[9px] text-emerald-600 font-bold">+12% vs last wk</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] uppercase font-black text-[var(--text-secondary)]">Attention</div>
                  <div className="text-xl font-black text-cyan-500 mt-1">76%</div>
                  <div className="text-[9px] text-cyan-600 font-bold">Stable focus</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] uppercase font-black text-[var(--text-secondary)]">Reaction Speed</div>
                  <div className="text-xl font-black text-purple-500 mt-1">1.8s</div>
                  <div className="text-[9px] text-purple-600 font-bold">Normal latency</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] uppercase font-black text-[var(--text-secondary)]">Consistency</div>
                  <div className="text-xl font-black text-amber-500 mt-1">84%</div>
                  <div className="text-[9px] text-amber-600 font-bold">5-Day streak 🔥</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STAGE 6 (45–52s): SMART CAREGIVER ALERTS ──────────────────── */}
          {currentStage.id === 6 && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center text-xl shrink-0">
                  🚨
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-amber-600">Simulated Alert</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">15 mins overdue</span>
                  </div>
                  <h4 className="text-sm font-black text-[var(--text-primary)]">
                    Afternoon Medication Unconfirmed
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                    "Memantine HCl (10mg) not checked off after 01:00 PM lunch window. Gentle audio chime played to patient; notification sent to caregiver."
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-black uppercase text-emerald-600">Positive Engagement Notice</span>
                  <h4 className="text-sm font-black text-[var(--text-primary)]">
                    Hydration Goal Completed
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                    "Patient logged 6 of 6 prescribed water glasses today."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── STAGE 7 (52–57s): OFFLINE-FIRST ARCHITECTURE ──────────────── */}
          {currentStage.id === 7 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                  <WifiOff className="w-6 h-6 text-rose-500 mx-auto" />
                  <div className="text-xs font-black text-rose-500">1. Offline Mode</div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Games & checkoffs cached in local offline vault.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
                  <div className="text-xs font-black text-amber-500">2. Reconnecting...</div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Auto-detects network; pushes queued records.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                  <div className="text-xs font-black text-emerald-500">3. Synced 🟢</div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Zero data loss. Caregiver cloud updated.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── STAGE 8 (57–60s): FINAL BRAND & SIH SUMMARY ───────────────── */}
          {currentStage.id === 8 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white text-center space-y-4 animate-fade-in shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-teal-400 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-2xl">
                  🏆
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-300 via-teal-300 to-white bg-clip-text text-transparent">
                  AABHA AI — SIH26003
                </h3>
                <p className="text-sm font-semibold text-purple-200 mt-1 max-w-md mx-auto leading-relaxed">
                  "Supporting memory. Empowering independence. Connecting caregivers."
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  ✓ 6 Cognitive Games
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  ✓ 5 Regional Languages
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  ✓ Offline-First Vault
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  ✓ Caregiver Analytics
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ─── FOOTER BAR ──────────────────────────────────────────────────── */}
        <div className="px-5 sm:px-8 py-3.5 bg-[var(--bg-surface-secondary)] border-t border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Fictional sample data for SIH judges • Zero medical claims</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="btn-glass px-3.5 py-1.5 text-xs font-bold cursor-pointer"
            >
              ↻ Restart Demo
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-glow px-5 py-1.5 text-xs font-black cursor-pointer shadow-md"
            >
              Exit Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OneMinuteDemoExperience;

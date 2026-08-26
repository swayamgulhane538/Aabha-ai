import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Bot, Play, Shield, Wifi, FileText, Bell, Trophy } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface DemoStep {
  step: number;
  title: string;
  desc: string;
  actionLabel: string;
  route: string;
  icon: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: 'Step 1: Patient Login (Mr. Arun Das)',
    desc: 'Experience frictionless, elderly-friendly authentication with pre-configured demo patient account.',
    actionLabel: 'Go to Patient Dashboard',
    route: '/patient',
    icon: '👤'
  },
  {
    step: 2,
    title: 'Step 2 & 3: AABHA AI Voice Assistant & Schedule Retrieval',
    desc: 'Voice greeting and speech intent retrieval. Ask: "What do I have today?" or "When is my medicine?" to retrieve real stored records.',
    actionLabel: 'Launch Voice Assistant',
    route: '/aabha',
    icon: '🎤'
  },
  {
    step: 4,
    title: 'Step 4: Start Cognitive Memory Game',
    desc: 'Launch Game 1 (Memory Match) or Game 5 (Daily Routine Ordering) with real-time accuracy and latency tracking.',
    actionLabel: 'Play Memory Match',
    route: '/patient/games/memory-match',
    icon: '🎴'
  },
  {
    step: 5,
    title: 'Step 5 & 6: Adaptive AI Difficulty Engine',
    desc: 'Observe the transparent AI engine adjust difficulty: >85% increases difficulty to Level 3, <60% adjusts to a gentler pace.',
    actionLabel: 'View Cognitive Games Hub',
    route: '/patient/games',
    icon: '🧠'
  },
  {
    step: 7,
    title: 'Step 7 & 8: Caregiver Dashboard & 4-Pillar Analytics',
    desc: 'Switch to Caregiver Portal (Dr. Anita Verma) to view 4-pillar scores (Memory: 82, Attention: 76, Reaction: 79, Consistency: 84).',
    actionLabel: 'Open Caregiver Portal',
    route: '/caregiver',
    icon: '📊'
  },
  {
    step: 9,
    title: 'Step 9: Smart Caregiver Alerts',
    desc: 'Non-diagnostic threshold alerts for pending medicines, baseline variations, and missed routines.',
    actionLabel: 'Check Caregiver Alerts',
    route: '/caregiver',
    icon: '🚨'
  },
  {
    step: 10,
    title: 'Step 10: Offline-First & Automatic Sync',
    desc: 'Live 🟢 Synced / 🔴 Offline indicator. Local storage queue records games and checkoffs offline, auto-syncing when reconnected.',
    actionLabel: 'Check Daily Routine',
    route: '/patient',
    icon: '📡'
  },
  {
    step: 11,
    title: 'Step 11: Weekly AI Summary Report Generation',
    desc: 'Generate caregiver summary with activity trends, response speeds, and explicit non-diagnostic medical disclaimer.',
    actionLabel: 'Generate Weekly Report',
    route: '/caregiver',
    icon: '📑'
  }
];

export const HackathonDemoModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const current = DEMO_STEPS[currentStepIdx];

  const handleExecuteStep = () => {
    navigate(current.route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-modal-overlay)] backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] rounded-[28px] p-6 sm:p-8 max-w-2xl w-full border border-[var(--border)] shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto font-sans text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-black uppercase">
                SIH26003 Official Demo Tour
              </span>
              <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                5-Minute Hackathon Flow
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
              AABHA AI Hackathon Scenario Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-lg font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {DEMO_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStepIdx(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStepIdx
                  ? 'w-8 bg-emerald-400'
                  : idx < currentStepIdx
                  ? 'w-3 bg-emerald-500/40'
                  : 'w-3 bg-[var(--border)]'
              }`}
              title={s.title}
            />
          ))}
        </div>

        {/* Current Step Spotlight Card */}
        <div className="p-6 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl shrink-0 shadow-md">
              {current.icon}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase text-emerald-400">
                Step {current.step} of {DEMO_STEPS.length}
              </span>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                {current.title}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
            {current.desc}
          </p>

          <div className="pt-2">
            <button
              onClick={handleExecuteStep}
              className="btn-glow w-full py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* All Steps Quick List */}
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">
            All 11 Scenario Checkpoints:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStepIdx(idx)}
                className={`p-2.5 rounded-xl text-left border transition flex items-center justify-between cursor-pointer ${
                  idx === currentStepIdx
                    ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 font-bold'
                    : 'bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="truncate">{s.icon} {s.title}</span>
                {idx === currentStepIdx && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fictional sample data for hackathon evaluation</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
              disabled={currentStepIdx === 0}
              className="btn-glass px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStepIdx(prev => Math.min(DEMO_STEPS.length - 1, prev + 1))}
              disabled={currentStepIdx === DEMO_STEPS.length - 1}
              className="btn-glass px-3 py-1.5 text-xs text-emerald-400 font-bold disabled:opacity-40"
            >
              Next Step →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDemoModal;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Bot, Play, Shield, Wifi, FileText, Bell, Trophy, PlayCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { ModalPortal } from './ModalPortal';
import { OneMinuteDemoExperience } from './OneMinuteDemoExperience';

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
  const [is1MinDemoOpen, setIs1MinDemoOpen] = useState(false);

  if (!isOpen) return null;

  const current = DEMO_STEPS[currentStepIdx];

  const handleExecuteStep = () => {
    navigate(current.route);
    onClose();
  };

  const headerTitle = (
    <div>
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-400/30 text-[10px] font-black uppercase">
          SIH26003 Official Demo Area
        </span>
        <span className="text-[10px] font-bold text-[var(--text-secondary)]">
          Demo Presentation Mode
        </span>
      </div>
      <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] mt-1">
        AABHA AI Hackathon Scenario Guide
      </h2>
    </div>
  );

  return (
    <>
      <ModalPortal isOpen={isOpen} onClose={onClose} title={headerTitle} maxWidth="max-w-2xl">
        <div className="space-y-4 font-sans text-[var(--text-primary)]">
          {/* 3-Minute Automated Real-Life Demo Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border border-purple-500/30">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Judges 3-Minute Real-Life Showcase
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black">
                3-Minute Real-Life Journey with BGM & Voiceover
              </h3>
              <p className="text-[11px] text-purple-200">
                Self-playing 8-stage story featuring Arun Das, Dr. Anita & family with AI speech.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIs1MinDemoOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition cursor-pointer shadow-md flex items-center gap-1.5 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>▶ Start 3-Min Demo</span>
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStepIdx(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIdx
                    ? 'w-8 bg-purple-600'
                    : idx < currentStepIdx
                    ? 'w-3 bg-purple-400/50'
                    : 'w-3 bg-[var(--border)]'
                }`}
                title={s.title}
              />
            ))}
          </div>

          {/* Current Step Spotlight Card */}
          <div className="p-5 sm:p-6 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl shrink-0 shadow-md">
                {current.icon}
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-purple-600 dark:text-purple-400">
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
              Manual Scenario Checkpoints:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {DEMO_STEPS.map((s, idx) => (
                <button
                  key={s.step}
                  onClick={() => setCurrentStepIdx(idx)}
                  className={`p-2.5 rounded-xl text-left border transition flex items-center justify-between cursor-pointer ${
                    idx === currentStepIdx
                      ? 'bg-purple-500/15 border-purple-500 text-purple-600 dark:text-purple-300 font-bold'
                      : 'bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className="truncate">{s.icon} {s.title}</span>
                  {idx === currentStepIdx && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px]">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Fictional sample data for SIH judges</span>
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
                className="btn-glass px-3 py-1.5 text-xs text-purple-600 dark:text-purple-400 font-bold disabled:opacity-40"
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>

      {/* 1-Minute Automated Demo Experience Overlay */}
      {is1MinDemoOpen && (
        <OneMinuteDemoExperience
          isOpen={is1MinDemoOpen}
          onClose={() => setIs1MinDemoOpen(false)}
        />
      )}
    </>
  );
};

export default HackathonDemoModal;

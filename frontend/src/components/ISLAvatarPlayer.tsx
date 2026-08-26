import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Volume2,
  HandMetal,
  Activity,
  Layers,
  CheckCircle2,
  Gauge
} from 'lucide-react';
import { ISLGlossToken } from '../services/textToISLService';
import { islAnimationService, AnimationPlayerState } from '../services/islAnimationService';

interface ISLAvatarPlayerProps {
  sequence: ISLGlossToken[];
  originalDoctorText?: string;
  isEmergency?: boolean;
  autoPlay?: boolean;
}

export const ISLAvatarPlayer: React.FC<ISLAvatarPlayerProps> = ({
  sequence,
  originalDoctorText = 'Where are you feeling pain?',
  isEmergency = false,
  autoPlay = true
}) => {
  const [playerState, setPlayerState] = useState<AnimationPlayerState>({
    isPlaying: false,
    currentStepIndex: 0,
    totalSteps: sequence.length,
    currentGloss: sequence[0] || null,
    progressPercent: 0,
    isCompleted: false
  });

  const [handAnimationPhase, setHandAnimationPhase] = useState<'IDLE' | 'MOVING' | 'HOLD'>('MOVING');

  useEffect(() => {
    islAnimationService.onStateChange((state) => {
      setPlayerState(state);
    });

    if (sequence && sequence.length > 0) {
      islAnimationService.setSequence(sequence);
      if (autoPlay) {
        islAnimationService.play();
      }
    }

    return () => {
      islAnimationService.stop();
    };
  }, [sequence, autoPlay]);

  // Motion cycle for animated hands
  useEffect(() => {
    if (!playerState.isPlaying) return;
    const interval = setInterval(() => {
      setHandAnimationPhase(prev => (prev === 'MOVING' ? 'HOLD' : 'MOVING'));
    }, 700);
    return () => clearInterval(interval);
  }, [playerState.isPlaying]);

  const activeGloss = playerState.currentGloss || sequence[0];

  const handleTogglePlay = () => {
    if (playerState.isPlaying) {
      islAnimationService.pause();
    } else {
      islAnimationService.play();
    }
  };

  const handleReplay = () => {
    islAnimationService.replay();
  };

  const handleStepClick = (index: number) => {
    islAnimationService.jumpToStep(index);
  };

  return (
    <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-tr from-slate-950 via-indigo-950/80 to-slate-900 border-2 border-purple-400/50 shadow-2xl p-4 sm:p-6 flex flex-col justify-between min-h-[380px] sm:min-h-[420px] text-white select-none">
      {/* ─── 1. TOP HEADER: GLOSS SEQUENCE PILLS ─────────────────────────────── */}
      <div className="space-y-3 z-10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-400 animate-ping" />
            <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[10px] font-black uppercase tracking-wider">
              🤟 ISL Avatar • Doctor Sign Language
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-purple-300 font-bold bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
            <span>Step {playerState.currentStepIndex + 1} of {sequence.length || 1}</span>
          </div>
        </div>

        {/* Gloss Sequence Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {sequence.map((item, idx) => {
            const isActive = idx === playerState.currentStepIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleStepClick(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-white shadow-lg scale-105'
                    : 'bg-black/50 text-slate-300 border-white/10 hover:border-purple-400/50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.gloss}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 2. MAIN CENTER: ANIMATED ISL AVATAR GESTURE STAGE ───────────────── */}
      <div className="my-auto py-6 flex flex-col items-center justify-center text-center relative z-10">
        {/* Animated Hand Gesture Stage Box */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-purple-900/60 via-indigo-800/40 to-teal-900/50 border-4 border-purple-400/40 flex items-center justify-center shadow-2xl mb-3">
          {/* Pulsing Aura */}
          <div className={`absolute inset-0 rounded-full bg-purple-500/20 transition-all duration-700 ${
            handAnimationPhase === 'MOVING' ? 'scale-110 opacity-80' : 'scale-95 opacity-30'
          }`} />

          {/* Large Animated Sign Icon */}
          <div className={`text-6xl sm:text-7xl transition-transform duration-500 transform ${
            handAnimationPhase === 'MOVING' ? 'scale-115 -translate-y-2' : 'scale-100 translate-y-0'
          }`}>
            {activeGloss?.icon || '🤟'}
          </div>

          {/* Hand Pose Badge */}
          <div className="absolute -bottom-2 bg-purple-600 text-white border-2 border-white px-3 py-0.5 rounded-full text-[11px] font-black uppercase shadow-lg">
            {activeGloss?.visualCue || 'Hand Gesture'}
          </div>
        </div>

        {/* Large Visual Sign Meaning (High Contrast for Non-Literate Patients) */}
        <div className="space-y-1 mt-1">
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-wide">
            {activeGloss?.gloss}
          </div>
          <div className="text-sm sm:text-base font-bold text-purple-200">
            {activeGloss?.hindiGloss && `(${activeGloss.hindiGloss})`}
          </div>
          <p className="text-xs text-slate-300 font-medium max-w-sm px-2">
            {activeGloss?.description}
          </p>
        </div>
      </div>

      {/* ─── 3. BOTTOM CONTROLS & PROGRESS BAR ───────────────────────────────── */}
      <div className="space-y-3 z-10 pt-2">
        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-200"
            style={{ width: `${playerState.progressPercent}%` }}
          />
        </div>

        {/* Player Controls Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black flex items-center gap-1.5 text-xs transition cursor-pointer shadow-md"
            >
              {playerState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{playerState.isPlaying ? 'Pause Signs' : 'Play Signs'}</span>
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
              title="Replay from start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replay</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-300 font-bold bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
            <span>Doctor: "{originalDoctorText}"</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ISLAvatarPlayer;

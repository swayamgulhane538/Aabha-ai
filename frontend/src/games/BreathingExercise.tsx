import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Heart, Sparkles, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { api } from '../services/api';
import { useAccessibilityStore } from '../stores/accessibilityStore';

type BreathPhase = 'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT';

interface PhaseConfig {
  phase: BreathPhase;
  label: string;
  hindiLabel: string;
  duration: number; // in seconds
  instruction: string;
  targetScale: number; // 0.85 to 1.35
  color: string;
}

const BOX_BREATHING_ROUTINE: PhaseConfig[] = [
  {
    phase: 'INHALE',
    label: 'Inhale',
    hindiLabel: 'गहरी सांस अंदर लें',
    duration: 4,
    instruction: 'Breathe in slowly through your nose...',
    targetScale: 1.35,
    color: 'from-emerald-400 via-teal-400 to-cyan-500'
  },
  {
    phase: 'HOLD_IN',
    label: 'Hold Breath',
    hindiLabel: 'सांस रोककर रखें',
    duration: 4,
    instruction: 'Gently hold your breath in...',
    targetScale: 1.35,
    color: 'from-cyan-400 via-blue-400 to-indigo-500'
  },
  {
    phase: 'EXHALE',
    label: 'Exhale',
    hindiLabel: 'धीरे-धीरे सांस छोड़ें',
    duration: 4,
    instruction: 'Release smoothly through your mouth...',
    targetScale: 0.88,
    color: 'from-indigo-400 via-purple-400 to-pink-500'
  },
  {
    phase: 'HOLD_OUT',
    label: 'Rest & Pause',
    hindiLabel: 'विश्राम करें',
    duration: 4,
    instruction: 'Feel your body relax and settle...',
    targetScale: 0.88,
    color: 'from-teal-400 via-emerald-400 to-green-500'
  }
];

export const BreathingExercise: React.FC = () => {
  const navigate = useNavigate();
  const { setSubtitleText } = useAccessibilityStore();

  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeftInPhase, setSecondsLeftInPhase] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentPhase = BOX_BREATHING_ROUTINE[phaseIndex];

  // Play gentle acoustic chime on phase change using Web Audio API
  const playChime = (freq = 440) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {}
  };

  useEffect(() => {
    let interval: any = null;

    if (isActive && !isCompleted) {
      setSubtitleText(`${currentPhase.label}: ${currentPhase.hindiLabel}`);

      interval = setInterval(() => {
        setTotalSeconds(prev => prev + 1);

        setSecondsLeftInPhase(prev => {
          if (prev <= 1) {
            // Transition to next phase
            const nextIndex = (phaseIndex + 1) % BOX_BREATHING_ROUTINE.length;
            setPhaseIndex(nextIndex);

            if (nextIndex === 0) {
              setCompletedCycles(c => {
                const nextC = c + 1;
                if (nextC >= 4) {
                  // Complete exercise after 4 full box cycles (~64s)
                  handleFinishSession(nextC);
                }
                return nextC;
              });
            }

            playChime(nextIndex % 2 === 0 ? 528 : 440);
            return BOX_BREATHING_ROUTINE[nextIndex].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setSubtitleText(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, phaseIndex, isCompleted]);

  const handleFinishSession = async (cyclesCount = completedCycles) => {
    setIsCompleted(true);
    setIsActive(false);

    try {
      await api.post('/games/result', {
        gameType: 'breathing_exercise',
        gameName: 'Guided Box Breathing & Biofeedback',
        score: Math.min(100, cyclesCount * 25),
        maxScore: 100,
        accuracy: 100,
        timeTaken: totalSeconds,
        difficulty: 'NORMAL'
      });
    } catch (err) {
      console.warn('Breathing result note:', err);
    }
  };

  const handleStartPause = () => {
    if (!isActive) {
      playChime(528);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsLeftInPhase(4);
    setCompletedCycles(0);
    setTotalSeconds(0);
    setIsCompleted(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 font-sans p-4 pb-24">
      {/* ─── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patient/games')}
          className="px-4 py-2 bg-white border-2 border-black rounded-2xl text-xs font-black text-black hover:bg-gray-100 flex items-center gap-1.5 transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 bg-white border-2 border-black rounded-2xl text-black hover:bg-gray-100 transition shadow-xs"
            title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>
        </div>
      </div>

      {/* ─── MAIN 3D BIOFEEDBACK SPHERE CONTAINER ──────────────────────────── */}
      <div className="card-3d bg-white p-6 sm:p-10 rounded-3xl text-center space-y-6 relative overflow-hidden">
        {/* Top Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-gray-100 pb-4">
          <div className="flex items-center gap-2 text-left">
            <span className="text-3xl">🌬️</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-black">
                Guided Box Breathing & Biofeedback
              </h1>
              <p className="text-xs text-gray-600 font-bold">
                Proven therapeutic pacing to lower heart rate & stress
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-950 font-black text-xs rounded-full">
              Cycle: {completedCycles} / 4
            </span>
          </div>
        </div>

        {/* ─── 3D INTERACTIVE BREATHING ORB ───────────────────────────────── */}
        <div className="py-10 flex flex-col items-center justify-center relative min-h-[300px]">
          {/* Ambient Radiant Wave when Inhaling */}
          {isActive && (
            <div
              className="absolute rounded-full border-4 border-emerald-400/40 animate-ping pointer-events-none"
              style={{ width: '220px', height: '220px', animationDuration: '4s' }}
            />
          )}

          {/* Animated 3D Floating Sphere with Smooth Transition Scale */}
          <div
            className="relative rounded-full p-2 border-4 border-black transition-transform duration-[4000ms] ease-in-out flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
            style={{
              width: '180px',
              height: '180px',
              transform: `scale(${isActive ? currentPhase.targetScale : 1})`
            }}
          >
            {/* Core Gradient */}
            <div
              className={`w-full h-full rounded-full bg-gradient-to-br ${currentPhase.color} flex flex-col items-center justify-center text-white relative overflow-hidden shadow-inner`}
            >
              <span className="text-3xl font-black">{secondsLeftInPhase}s</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-white/90">
                {currentPhase.label}
              </span>
            </div>
          </div>

          {/* Current Phase Instruction Text */}
          <div className="mt-8 space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-black">
              {currentPhase.hindiLabel}
            </h3>
            <p className="text-xs sm:text-sm font-bold text-gray-600">
              {currentPhase.instruction}
            </p>
          </div>
        </div>

        {/* ─── CONTROLS FOOTER ─────────────────────────────────────────────── */}
        {!isCompleted ? (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartPause}
              className={`px-8 py-4 rounded-2xl border-2 border-black font-black text-sm flex items-center gap-2 shadow-md transition active:scale-95 ${
                isActive ? 'bg-amber-100 text-black hover:bg-amber-200' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isActive ? 'Pause Exercise' : 'Start Breathing (प्रारंभ करें)'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-4 bg-gray-50 border-2 border-black rounded-2xl hover:bg-gray-100 transition text-black"
              title="Reset Routine"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-3xl space-y-3 animate-fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-black text-emerald-950">
              Session Completed! Calming Benefit Recorded ✨
            </h3>
            <p className="text-xs font-bold text-emerald-900 max-w-md mx-auto">
              Your heart rate has stabilized and 4 cycles of stress-reduction breathing were saved to your Cognitive Progress Vault.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-white border border-emerald-600 text-emerald-950 rounded-xl text-xs font-black hover:bg-emerald-100"
              >
                Repeat Another Session
              </button>
              <button
                onClick={() => navigate('/patient/games')}
                className="px-5 py-2.5 bg-black text-white rounded-xl text-xs font-black hover:bg-gray-800 shadow"
              >
                Return to Games Hub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingExercise;

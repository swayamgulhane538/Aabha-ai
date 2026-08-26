import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Mic, Volume2, AlertTriangle, Radio } from 'lucide-react';

export type OrbState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR';

interface Abha3DOrbProps {
  state?: OrbState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
  onClick?: () => void;
  showLabel?: boolean;
  className?: string;
}

export const Abha3DOrb: React.FC<Abha3DOrbProps> = ({
  state = 'IDLE',
  size = 'md',
  interactive = true,
  onClick,
  showLabel = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const sizeMap = {
    sm: { container: 'w-12 h-12', core: 'w-8 h-8', ring: 'w-11 h-11', icon: 'w-3.5 h-3.5', glow: 'w-16 h-16' },
    md: { container: 'w-18 h-18', core: 'w-12 h-12', ring: 'w-16 h-16', icon: 'w-5 h-5', glow: 'w-24 h-24' },
    lg: { container: 'w-28 h-28', core: 'w-20 h-20', ring: 'w-26 h-26', icon: 'w-8 h-8', glow: 'w-36 h-36' },
    hero: { container: 'w-44 h-44', core: 'w-32 h-32', ring: 'w-40 h-40', icon: 'w-12 h-12', glow: 'w-56 h-56' }
  }[size];

  const stateConfig = {
    IDLE: {
      coreGradient: 'from-emerald-400 via-teal-400 to-indigo-600',
      glowColor: 'rgba(16, 185, 129, 0.45)',
      ringBorder: 'border-emerald-400/40',
      innerShadow: 'shadow-[inset_-8px_-8px_16px_rgba(10,37,64,0.6),inset_8px_8px_16px_rgba(255,255,255,0.4)]',
      label: 'Tap or Say "Hey Aabha"',
      icon: Sparkles
    },
    LISTENING: {
      coreGradient: 'from-cyan-400 via-emerald-400 to-blue-600',
      glowColor: 'rgba(6, 182, 212, 0.6)',
      ringBorder: 'border-cyan-400/60',
      innerShadow: 'shadow-[inset_-8px_-8px_16px_rgba(6,182,212,0.8),inset_8px_8px_16px_rgba(255,255,255,0.6)]',
      label: 'Listening to your voice...',
      icon: Mic
    },
    THINKING: {
      coreGradient: 'from-purple-400 via-indigo-500 to-amber-400',
      glowColor: 'rgba(168, 85, 247, 0.55)',
      ringBorder: 'border-purple-400/60',
      innerShadow: 'shadow-[inset_-8px_-8px_16px_rgba(168,85,247,0.8),inset_8px_8px_16px_rgba(255,255,255,0.5)]',
      label: 'Thinking & processing...',
      icon: Sparkles
    },
    SPEAKING: {
      coreGradient: 'from-indigo-400 via-purple-500 to-pink-500',
      glowColor: 'rgba(99, 102, 241, 0.65)',
      ringBorder: 'border-indigo-400/60',
      innerShadow: 'shadow-[inset_-8px_-8px_16px_rgba(99,102,241,0.8),inset_8px_8px_16px_rgba(255,255,255,0.6)]',
      label: 'Speaking gently...',
      icon: Volume2
    },
    ERROR: {
      coreGradient: 'from-rose-400 via-amber-500 to-red-600',
      glowColor: 'rgba(239, 68, 68, 0.5)',
      ringBorder: 'border-rose-400/60',
      innerShadow: 'shadow-[inset_-8px_-8px_16px_rgba(239,68,68,0.8),inset_8px_8px_16px_rgba(255,255,255,0.5)]',
      label: 'Tap to try again',
      icon: AlertTriangle
    }
  }[state];

  const IconComponent = stateConfig.icon;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center select-none ${
        interactive ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {/* ─── LAYER 1: RADIATING SOUNDWAVES ──────────────────────────────────── */}
      {(state === 'LISTENING' || state === 'SPEAKING') && (
        <>
          <div
            className={`absolute rounded-full border border-emerald-400/60 animate-wave-radiate pointer-events-none ${sizeMap.glow}`}
            style={{ animationDelay: '0s' }}
          />
          <div
            className={`absolute rounded-full border border-cyan-400/50 animate-wave-radiate pointer-events-none ${sizeMap.glow}`}
            style={{ animationDelay: '0.7s' }}
          />
          <div
            className={`absolute rounded-full border border-indigo-400/40 animate-wave-radiate pointer-events-none ${sizeMap.glow}`}
            style={{ animationDelay: '1.4s' }}
          />
        </>
      )}

      {/* ─── LAYER 2: VOLUMETRIC GLOW HALO ──────────────────────────────────── */}
      <div
        className={`absolute rounded-full blur-2xl transition-all duration-700 pointer-events-none ${sizeMap.glow}`}
        style={{
          background: `radial-gradient(circle, ${stateConfig.glowColor} 0%, rgba(6,9,19,0) 72%)`
        }}
      />

      {/* ─── LAYER 3: 3D ROTATING ORBIT RINGS ───────────────────────────────── */}
      <div
        className={`absolute rounded-full border ${stateConfig.ringBorder} animate-spin-slow pointer-events-none ${sizeMap.ring}`}
        style={{
          transform: 'rotateX(65deg) rotateY(20deg)'
        }}
      />
      <div
        className={`absolute rounded-full border border-dashed border-cyan-400/30 animate-spin-reverse pointer-events-none ${sizeMap.ring}`}
        style={{
          transform: 'rotateX(-60deg) rotateY(-25deg)'
        }}
      />

      {/* ─── LAYER 4: 3D LUMINOUS SPHERE CORE ────────────────────────────────── */}
      <div
        className={`relative rounded-full bg-gradient-to-tr ${stateConfig.coreGradient} ${stateConfig.innerShadow} flex items-center justify-center shadow-2xl transition-transform duration-500 ${
          interactive ? 'group-hover:scale-110 group-hover:rotate-6' : ''
        } ${sizeMap.core} animate-orb-glow`}
      >
        {/* Specular Highlight */}
        <div className="absolute top-1.5 left-2 w-3 h-2 rounded-full bg-white/70 blur-[1px] pointer-events-none" />

        {/* Central Icon */}
        <IconComponent className={`text-white drop-shadow-md transition-transform duration-300 ${sizeMap.icon}`} />

        {/* Ambient Ring Waveform */}
        {state === 'SPEAKING' && (
          <div className="absolute inset-0 rounded-full border-2 border-white/80 animate-ping pointer-events-none" />
        )}
      </div>

      {/* ─── LAYER 5: OPTIONAL FLOATING STATUS LABEL ─────────────────────────── */}
      {showLabel && (
        <div
          className="mt-2.5 px-3 py-1 rounded-full backdrop-blur-md shadow-lg text-[11px] font-black flex items-center gap-1.5"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          <span className={`w-2 h-2 rounded-full ${state === 'ERROR' ? 'bg-rose-500' : 'bg-emerald-400'} animate-pulse`} />
          <span>{t(stateConfig.label)}</span>
        </div>
      )}
    </div>
  );
};

export default Abha3DOrb;

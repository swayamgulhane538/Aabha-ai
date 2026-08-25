import React from 'react';
import { TrendingUp, Sparkles, Brain, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Health3DWidgetProps {
  score?: number;
  delta?: string;
  category?: string;
  className?: string;
}

export const Health3DWidget: React.FC<Health3DWidgetProps> = ({
  score = 78,
  delta = '↑ 6% from last week',
  category = 'Good & Improving',
  className = ''
}) => {
  // Compute SVG Circle Circumference for 3D progress ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={`card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 sm:p-7 rounded-[24px] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-[var(--card-border-inline)] ${className}`}
    >
      {/* Background Subtle Gradient Lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Left Info & Breakdown */}
      <div className="space-y-3 text-center sm:text-left z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-[11px] font-black text-emerald-300 uppercase shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
          <span>AI Cognitive Vitality</span>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            Overall Cognitive Health
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-0.5">
            Evaluated from daily memory stories, games & mood wellness
          </p>
        </div>

        {/* Breakdown Mini Badges */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
          <span className="px-2.5 py-1 bg-[var(--bg-surface-secondary)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-secondary)]">
            🧠 Memory: 78%
          </span>
          <span className="px-2.5 py-1 bg-[var(--bg-surface-secondary)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-secondary)]">
            🎯 Focus: 84%
          </span>
          <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-400/30 rounded-xl text-xs font-bold text-emerald-300">
            💊 Routine: 95%
          </span>
        </div>

        <div className="pt-1 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
          <Link
            to="/patient/games"
            className="text-xs font-black text-emerald-300 bg-emerald-500/15 px-3.5 py-1.5 rounded-xl border border-emerald-400/30 inline-flex items-center gap-1.5 hover:bg-emerald-500/25 transition shadow-2xs"
          >
            <span>🎮 Practice Cognitive Games</span>
            <span>→</span>
          </Link>
          <Link
            to="/patient/progress"
            className="text-xs font-bold text-[var(--text-secondary)] underline inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition"
          >
            <span>Cognitive Progress Vault</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Right 3D Circular Progress Sphere */}
      <div className="relative flex items-center justify-center z-10 shrink-0">
        {/* Soft Ambient Depth Glow */}
        <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 blur-xl pointer-events-none" />

        {/* 3D SVG Progress Ring */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
            {/* Background Track */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              className="text-[var(--border)]"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
            />
            {/* 3D Colored Progress Gradient Bar */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke="url(#progressGrad)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Score Readout */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{score}%</span>
            <span className="text-[10px] font-black uppercase text-emerald-400">{category}</span>
            <span className="text-[10px] font-bold text-[var(--text-secondary)] mt-0.5">{delta}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health3DWidget;

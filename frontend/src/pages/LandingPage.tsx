import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Gamepad2,
  Video,
  ShieldCheck,
  Brain,
  Bell,
  HeartHandshake,
  BookOpen,
  Award,
  Globe
} from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';
import { Abha3DOrb } from '../components/Abha3DOrb';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { useAuthStore } from '../stores/authStore';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { continueWithDemoAccount } = useAuthStore();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleInstantDemo = async () => {
    setDemoLoading(true);
    try {
      await continueWithDemoAccount();
      navigate('/patient', { replace: true });
    } catch (err) {
      navigate('/login');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen font-sans w-full max-w-[100vw] overflow-x-hidden relative select-none text-[var(--text-primary)]"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <AnimatedBackground />

      {/* ─── 1. TOP NAVIGATION ──────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl border-b border-[var(--border)] px-4 sm:px-8 md:px-14 py-3.5 flex items-center justify-between max-w-7xl mx-auto w-full"
        style={{ backgroundColor: 'var(--bg-header)' }}
      >
        <div className="flex items-center gap-3">
          <Abha3DOrb size="sm" state="IDLE" interactive={false} />
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            AABHA AI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-bold text-[var(--text-secondary)]">
          <a href="#features" className="hover:text-emerald-400 transition">Features</a>
          <a href="#games" className="hover:text-emerald-400 transition">18+ Games</a>
          <a href="#ai" className="hover:text-emerald-400 transition">Voice Assistant</a>
          <a href="#caregiver" className="hover:text-emerald-400 transition">Caregivers</a>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button
            onClick={handleInstantDemo}
            disabled={demoLoading}
            className="btn-glow px-4 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{demoLoading ? 'Starting...' : 'Demo Login'}</span>
          </button>
          <Link
            to="/login"
            className="btn-glass px-4 py-2 text-xs font-bold transition"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ─── 2. HERO / CINEMATIC 3D SHOWCASE ────────────────────────────────── */}
      <header className="relative z-10 pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 max-w-5xl mx-auto text-center w-full space-y-8">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 backdrop-blur-md text-xs font-black text-emerald-300 shadow-lg animate-badge-glow">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>SIH26003 • Clinical AI Cognitive Health & Dementia Assistant</span>
        </div>

        {/* 3D Centerpiece Orb */}
        <div className="py-2 flex justify-center">
          <Abha3DOrb size="hero" state="IDLE" interactive={true} onClick={handleInstantDemo} showLabel={true} />
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-[var(--text-primary)]">
            A caring voice, 18+ therapy games & intelligent memory care.
          </h1>
          <p className="text-sm sm:text-lg text-[var(--text-secondary)] font-medium max-w-2xl mx-auto leading-relaxed">
            Designed with gentle warmth for elderly minds: Voice-first multilingual AI companion, daily cognitive exercises, audible alarms & secure memory vaults.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto pt-2">
          <button
            onClick={handleInstantDemo}
            disabled={demoLoading}
            className="btn-glow w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-black flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{demoLoading ? 'Opening Platform...' : 'Launch Demo Patient Portal →'}</span>
          </button>
          <Link
            to="/login"
            className="btn-glass w-full sm:w-auto px-7 py-4 text-sm sm:text-base font-bold text-center"
          >
            Sign In with Email / ID
          </Link>
        </div>

        {/* ─── 3. 4 HOLOGRAPHIC FEATURE GLASS CARDS ──────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-10 text-left max-w-5xl mx-auto">
          {/* Card 1: 18+ Games */}
          <div className="card-3d-interactive card-3d p-5 rounded-[22px] space-y-2 border border-purple-500/30 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🎮
            </div>
            <h2 className="text-base font-black text-[var(--text-primary)] group-hover:text-purple-300 transition-colors">18+ Cognitive Games</h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">2-player battles, memory match, sequence recall, mandala art & biofeedback breathing.</p>
          </div>

          {/* Card 2: Doctor Teleconsult */}
          <div className="card-3d-interactive card-3d p-5 rounded-[22px] space-y-2 border border-blue-500/30 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              👨‍⚕️
            </div>
            <h2 className="text-base font-black text-[var(--text-primary)] group-hover:text-blue-300 transition-colors">Doctor Teleconsult</h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">HD video consultation room with live closed captions and digital prescription notes.</p>
          </div>

          {/* Card 3: Medication & Alarms */}
          <div className="card-3d-interactive card-3d p-5 rounded-[22px] space-y-2 border border-emerald-500/30 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              ⏰
            </div>
            <h2 className="text-base font-black text-[var(--text-primary)] group-hover:text-emerald-300 transition-colors">Medication Routine</h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Audible chime alarm reminders, daily pill checklist, and family intake notifications.</p>
          </div>

          {/* Card 4: Memory Passport */}
          <div className="card-3d-interactive card-3d p-5 rounded-[22px] space-y-2 border border-amber-500/30 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              📖
            </div>
            <h2 className="text-base font-black text-[var(--text-primary)] group-hover:text-amber-300 transition-colors">Memory Passport</h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Childhood stories, beloved family albums, favorite melodies & reminiscence therapy.</p>
          </div>
        </div>
      </header>

      {/* ─── 4. FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full py-8 text-center text-xs text-[var(--text-muted)] font-medium border-t border-[var(--border)]">
        © 2026 AABHA AI • Production Healthcare & Dementia Care Platform • All Rights Reserved
      </footer>
    </div>
  );
};

export default LandingPage;

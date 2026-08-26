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
  Globe,
  Mic,
  Shield,
  Wifi,
  Users,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  Clock,
  Droplets,
  Pill
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/LanguageSelector';
import { Abha3DOrb } from '../components/Abha3DOrb';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { useAuthStore } from '../stores/authStore';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { continueWithDemoAccount } = useAuthStore();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleInstantDemo = async () => {
    setDemoLoading(true);
    try {
      await continueWithDemoAccount();
      navigate('/patient', { replace: true });
    } catch {
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

      {/* ─── 1. TOP NAVBAR ──────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl border-b border-[var(--border)] px-4 sm:px-8 md:px-14 py-3 flex items-center justify-between max-w-7xl mx-auto w-full"
        style={{ backgroundColor: 'var(--bg-header)' }}
      >
        <div className="flex items-center gap-3">
          <Abha3DOrb size="sm" state="IDLE" interactive={false} />
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            AABHA AI
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-[var(--text-secondary)]">
          <a href="#problem" className="hover:text-emerald-400 transition">{t('Problem')}</a>
          <a href="#solution" className="hover:text-emerald-400 transition">{t('Our Solution')}</a>
          <a href="#intelligence" className="hover:text-emerald-400 transition">{t('Cognitive AI')}</a>
          <a href="#games" className="hover:text-emerald-400 transition">{t('Adaptive Games')}</a>
          <a href="#voice" className="hover:text-emerald-400 transition">{t('Voice Assistant')}</a>
          <a href="#caregiver" className="hover:text-emerald-400 transition">{t('Caregiver')}</a>
          <a href="#offline" className="hover:text-emerald-400 transition">{t('Offline-First')}</a>
          <a href="#impact" className="hover:text-emerald-400 transition">{t('Impact')}</a>
          <a href="#faq" className="hover:text-emerald-400 transition">{t('FAQ')}</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          <button
            onClick={handleInstantDemo}
            disabled={demoLoading}
            className="btn-glow px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{demoLoading ? 'Starting...' : t('Demo Login')}</span>
          </button>
          <Link
            to="/login"
            className="btn-glass px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold transition"
          >
            {t('Sign In')}
          </Link>
        </div>
      </nav>

      {/* ─── 2. HERO SECTION (SIH26003 CORE) ────────────────────────────────── */}
      <header className="relative z-10 pt-10 pb-14 sm:pt-16 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center w-full space-y-6">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 backdrop-blur-md text-xs font-black text-emerald-300 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>SIH26003 • {t('Voice-First Clinical Health Companion')}</span>
        </div>

        {/* 3D Centerpiece Orb */}
        <div className="py-2 flex justify-center">
          <Abha3DOrb size="hero" state="IDLE" interactive={true} onClick={handleInstantDemo} showLabel={true} />
        </div>

        {/* Hero Headings */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-[var(--text-primary)]">
            AABHA AI
          </h1>
          <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent italic">
            "{t('A caring voice for every memory.')}"
          </p>
          <p className="text-xs sm:text-base text-[var(--text-secondary)] font-medium max-w-2xl mx-auto leading-relaxed">
            {t('Sign in to access your personalized memory passport, daily routine, medication alarms, and 18+ cognitive therapy games.')}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="btn-glow w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <span>{t('Get Started')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#solution"
            className="btn-glass w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('Explore AABHA')}</span>
          </a>

          <button
            onClick={handleInstantDemo}
            className="px-6 py-3.5 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs sm:text-sm font-black flex items-center justify-center gap-2 hover:bg-purple-500/30 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t('1-Click Hackathon Demo')}</span>
          </button>
        </div>

        {/* ─── NEW FEATURE • SIH26003: SIGNBRIDGE ISL HERO SPOTLIGHT ────────── */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-slate-950/80 border-2 border-purple-400/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-left relative overflow-hidden">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center justify-center text-4xl sm:text-5xl shrink-0 shadow-inner animate-pulse">
              🤟
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[10px] font-black uppercase tracking-wider">
                  New Feature • SIH26003
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 text-xs font-mono font-bold">
                  Indian Sign Language (ISL)
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                SignBridge – Sign Language Doctor Consultation
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
                Real-time WebRTC teleconsultation for deaf and non-literate patients: Doctor natural speech translates into an animated 3D ISL Avatar; optical camera AI translates patient hand signs to voice & text with emergency triage.
              </p>
            </div>
          </div>

          <button
            onClick={handleInstantDemo}
            className="btn-glow w-full md:w-auto px-7 py-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>Try SignBridge Live →</span>
          </button>
        </div>

        {/* Non-Diagnostic Disclaimer Strip */}
        <div className="p-3 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] max-w-xl mx-auto text-[11px] text-[var(--text-secondary)] font-medium flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t('Non-diagnostic activity indicator')}</span>
        </div>
      </header>

      {/* ─── 3. SECTION 1: THE PROBLEM ──────────────────────────────────────── */}
      <section id="problem" className="relative z-10 py-12 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
            {t('Problem Statement')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)]">
            {t('The Challenges Elderly Users & Caregivers Face')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="card-3d bg-[var(--card-bg-inline)] p-6 rounded-[24px] border border-[var(--card-border-inline)] space-y-2">
            <div className="text-3xl">🧩</div>
            <h3 className="text-base font-black text-[var(--text-primary)]">{t('Cognitive & Memory Difficulties')}</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              {t('Elderly individuals often struggle with short-term recall, misplacing daily items, and forgetting familiar family details, leading to distress and isolation.')}
            </p>
          </div>

          <div className="card-3d bg-[var(--card-bg-inline)] p-6 rounded-[24px] border border-[var(--card-border-inline)] space-y-2">
            <div className="text-3xl">💊</div>
            <h3 className="text-base font-black text-[var(--text-primary)]">{t('Medication & Routine Non-Adherence')}</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              {t('Missing critical doses of prescribed medicines and neglecting daily hydration leads to preventable hospitalizations and complications.')}
            </p>
          </div>

          <div className="card-3d bg-[var(--card-bg-inline)] p-6 rounded-[24px] border border-[var(--card-border-inline)] space-y-2">
            <div className="text-3xl">👨‍⚕️</div>
            <h3 className="text-base font-black text-[var(--text-primary)]">{t('Caregiver Burnout & Blind Spots')}</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              {t('Family members and clinicians lack real-time visibility into daily adherence, baseline cognitive changes, and emergency triggers.')}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 4. SECTION 2: OUR SOLUTION ─────────────────────────────────────── */}
      <section id="solution" className="relative z-10 py-12 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/30">
            {t('Our Solution')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)]">
            {t('How AABHA AI Empowers Elderly Care')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="card-3d bg-[var(--card-bg-inline)] p-5 rounded-[24px] border border-[var(--card-border-inline)] space-y-2">
            <div className="text-2xl">🧠</div>
            <h3 className="text-sm font-black text-[var(--text-primary)]">{t('Adaptive Brain Exercises')}</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {t('6 scientifically structured cognitive games that automatically adapt difficulty to patient performance.')}
            </p>
          </div>

          <div className="card-3d bg-[var(--card-bg-inline)] p-5 rounded-[24px] border border-[var(--card-border-inline)] space-y-2">
            <div className="text-2xl">🗣️</div>
            <h3 className="text-sm font-black text-[var(--text-primary)]">{t('Multilingual Voice Companion')}</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {t('Speak naturally in English, Hindi, Bengali, Assamese, or Marathi to check routines and medicines.')}
            </p>
          </div>

          <div className="card-3d bg-[var(--card-bg-inline)] p-5 rounded-[24px] border border-[var(--card-border-inline)] space-y-2">
            <div className="text-2xl">📖</div>
            <h3 className="text-sm font-black text-[var(--text-primary)]">{t('Personal Memory Bank')}</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {t('Caregiver-managed repository of family relations, childhood memories, and emergency facts.')}
            </p>
          </div>

          <div className="card-3d bg-[var(--card-bg-inline)] p-5 rounded-[24px] border border-[var(--card-border-inline)] space-y-2">
            <div className="text-2xl">📊</div>
            <h3 className="text-sm font-black text-[var(--text-primary)]">{t('Caregiver Analytics & Alerts')}</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {t('4-pillar activity scores, weekly AI summary reports, and instant smart alerts on baseline variations.')}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 5. SECTION 3: COGNITIVE INTELLIGENCE & 4-PILLAR ENGINE ─────────── */}
      <section id="intelligence" className="relative z-10 py-12 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        <div className="card-3d bg-[var(--card-bg-inline)] p-6 sm:p-10 rounded-[32px] border border-[var(--card-border-inline)] shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/30">
                {t('Cognitive Intelligence')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-2">
                {t('4-Pillar Non-Diagnostic Performance Engine')}
              </h2>
            </div>
            <div className="p-3 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] text-xs font-bold text-emerald-400">
              {t('Composite Activity Index')}: 80/100
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] space-y-1 text-center">
              <div className="text-xs font-black text-[var(--text-secondary)] uppercase">{t('Memory Score')}</div>
              <div className="text-3xl font-black text-emerald-400">82%</div>
              <p className="text-[10px] text-[var(--text-muted)]">{t('Visual & sequence card recall')}</p>
            </div>

            <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] space-y-1 text-center">
              <div className="text-xs font-black text-[var(--text-secondary)] uppercase">{t('Attention Score')}</div>
              <div className="text-3xl font-black text-cyan-400">76%</div>
              <p className="text-[10px] text-[var(--text-muted)]">{t('Focus & distractor discrimination')}</p>
            </div>

            <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] space-y-1 text-center">
              <div className="text-xs font-black text-[var(--text-secondary)] uppercase">{t('Reaction Speed')}</div>
              <div className="text-3xl font-black text-purple-400">79%</div>
              <p className="text-[10px] text-[var(--text-muted)]">{t('Average response: 1.8 seconds')}</p>
            </div>

            <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] space-y-1 text-center">
              <div className="text-xs font-black text-[var(--text-secondary)] uppercase">{t('Consistency')}</div>
              <div className="text-3xl font-black text-amber-400">84%</div>
              <p className="text-[10px] text-[var(--text-muted)]">{t('5-day consecutive exercise streak')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. SECTION 4: 6 CORE ADAPTIVE GAMES ────────────────────────────── */}
      <section id="games" className="relative z-10 py-12 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-400/30">
            {t('SIH26003 Games Suite')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)]">
            {t('6 Polished Core Cognitive Exercises')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[
            { id: 'memory-match', title: '1. Memory Match', desc: 'Remember & match pairs. Tracks accuracy, attempts & time.', icon: '🎴' },
            { id: 'remember-objects', title: '2. Remember the Objects', desc: 'Observe objects briefly, then identify remembered items.', icon: '🔍' },
            { id: 'attention-challenge', title: '3. Attention Finder', desc: 'Identify target items amid distractors with speed tracking.', icon: '👁️' },
            { id: 'sequence-recall', title: '4. Pattern Recall', desc: 'Reproduce flashing color & tone sequences accurately.', icon: '🔢' },
            { id: 'routine-ordering', title: '5. Daily Routine Ordering', desc: 'Arrange morning-to-night activities in chronological order.', icon: '📅' },
            { id: 'familiar-objects', title: '6. Familiar Object Recognition', desc: 'Identify everyday household objects and their common uses.', icon: '🍵' }
          ].map(g => (
            <div key={g.id} className="card-3d bg-[var(--card-bg-inline)] p-5 rounded-[24px] border border-[var(--card-border-inline)] space-y-2">
              <div className="text-3xl">{g.icon}</div>
              <h3 className="text-sm font-black text-[var(--text-primary)]">{t(g.title)}</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{t(g.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7. SECTION 5: OFFLINE-FIRST ARCHITECTURE ───────────────────────── */}
      <section id="offline" className="relative z-10 py-12 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        <div className="card-3d bg-gradient-to-r from-emerald-500/10 via-[var(--bg-surface)] to-teal-500/10 p-6 sm:p-10 rounded-[32px] border border-emerald-400/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-400/30">
              {t('Offline-First Technology')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              {t('Uninterrupted Care, Even Without Internet')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
              {t('Cognitive games, medicine alarms, daily routines, and memory bank profiles run completely offline using local client storage. When connectivity is restored, all data automatically syncs with duplicate resolution.')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black">
                🟢 {t('Synced')}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
                🟠 {t('Syncing')}
              </span>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black">
                🔴 {t('Offline')}
              </span>
            </div>
          </div>

          <div className="p-6 bg-[var(--bg-surface-secondary)] rounded-3xl border border-[var(--border)] text-center space-y-2 shrink-0 w-full md:w-72">
            <div className="text-4xl">📡</div>
            <div className="text-sm font-black text-[var(--text-primary)]">{t('Zero Data Loss')}</div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {t('Offline queue guarantees 100% session persistence.')}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 8. SECTION 6: IMPACT & SECURITY ────────────────────────────────── */}
      <section id="impact" className="relative z-10 py-12 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-400/30">
            {t('Real-World Impact & Privacy')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)]">
            {t('Trustworthy, Accessible & Secure')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="card-3d bg-[var(--card-bg-inline)] p-6 rounded-[24px] border border-[var(--card-border-inline)] space-y-2">
            <div className="text-3xl">👵</div>
            <h3 className="text-sm font-black text-[var(--text-primary)]">{t('Elderly-Centric Design')}</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {t('High-contrast typography, large 1-tap touch targets, minimal typing, and gentle audio prompts.')}
            </p>
          </div>

          <div className="card-3d bg-[var(--card-bg-inline)] p-6 rounded-[24px] border border-[var(--card-border-inline)] space-y-2">
            <div className="text-3xl">🔒</div>
            <h3 className="text-sm font-black text-[var(--text-primary)]">{t('Strict Role-Based Security')}</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {t('Patients and caregivers have strict authorization barriers. No personal memory facts are leaked or hallucinated.')}
            </p>
          </div>

          <div className="card-3d bg-[var(--card-bg-inline)] p-6 rounded-[24px] border border-[var(--card-border-inline)] space-y-2">
            <div className="text-3xl">🇮🇳</div>
            <h3 className="text-sm font-black text-[var(--text-primary)]">{t('Multilingual Inclusivity')}</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {t('Native translations and voice synthesis in English, Hindi, Bengali, Assamese, and Marathi.')}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 9. SECTION 7: FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="relative z-10 py-12 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/30">
            {t('Frequently Asked Questions')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {t('Got Questions About AABHA AI?')}
          </h2>
        </div>

        <div className="space-y-3 pt-2">
          {[
            { q: 'Does AABHA AI diagnose dementia or Alzheimer’s?', a: 'No. AABHA strictly tracks cognitive activity and daily routine engagement. It does NOT make clinical medical diagnoses.' },
            { q: 'Does the application work without internet?', a: 'Yes! All 6 core games, routine checkoffs, and reminders function offline and automatically synchronize when reconnected.' },
            { q: 'How does the Adaptive AI engine work?', a: 'The AI dynamically measures accuracy and reaction speed. Scores above 85% increase game difficulty, while scores under 60% adjust to a gentler pace.' },
            { q: 'Which languages are supported?', a: 'AABHA supports English, Hindi (हिंदी), Bengali (বাংলা), Assamese (অসমীয়া), and Marathi (मराठी).' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] space-y-1">
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">Q: {t(item.q)}</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{t(item.a)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 10. FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[var(--border)] py-8 px-4 sm:px-8 text-center text-xs text-[var(--text-secondary)] space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Abha3DOrb size="sm" state="IDLE" interactive={false} />
          <span className="font-black text-sm text-[var(--text-primary)]">AABHA AI — SIH26003</span>
        </div>
        <p>© 2026 AABHA AI. Developed for Smart India Hackathon Problem Statement SIH26003.</p>
        <p className="text-[10px] text-[var(--text-muted)]">
          {t('Cognitive companion & non-diagnostic healthcare prototype. All rights reserved.')}
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

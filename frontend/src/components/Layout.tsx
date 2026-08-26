import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { LanguageSelector } from './LanguageSelector';
import { SettingsModal } from './SettingsModal';
import { OfflineIndicator } from './OfflineIndicator';
import { HackathonDemoModal } from './HackathonDemoModal';
import { AnimatedBackground } from './AnimatedBackground';
import { Abha3DOrb } from './Abha3DOrb';
import { Settings, Sparkles, LogOut, Bell, User, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export const Layout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const isDark = useThemeStore(s => s.getResolvedTheme()) === 'dark';
  const navigate = useNavigate();
  const location = useLocation();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotificationsOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCaregiver = user?.role === 'CAREGIVER';

  const activeNavCls = 'bg-purple-600 text-white font-black shadow-xs';
  const inactiveNavCls = 'text-[var(--nav-inactive-text)] hover:text-[var(--text-primary)] hover:bg-[var(--btn-glass-bg-hover)] font-bold';

  const notificationsList = [
    { id: 1, title: 'Medication Due', desc: 'Memantine HCl (10mg) scheduled after lunch (01:00 PM)', time: '35 mins ago', unread: true },
    { id: 2, title: 'Daily Hydration Check', desc: '4 of 6 glasses completed. Keep it up!', time: '1 hour ago', unread: true },
    { id: 3, title: 'Memory Exercise Completed', desc: 'Memory Match scored 85% accuracy (Level 2)', time: '2 hours ago', unread: false }
  ];

  return (
    <div
      className="min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden font-sans relative"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      <AnimatedBackground />

      {/* ─── 1. CLEAN SINGLE-ROW STICKY HEADER ───────────────────────────────── */}
      <header
        className="backdrop-blur-xl px-3.5 sm:px-6 md:px-8 py-2.5 sm:py-3 shadow-xs flex items-center justify-between z-40 sticky top-0 w-full min-w-0 transition-all border-b border-[var(--border)]"
        style={{ backgroundColor: 'var(--bg-header)' }}
      >
        {/* LEFT: AABHA AI Logo & Tagline */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link
            to={isCaregiver ? '/caregiver' : '/patient'}
            className="flex items-center gap-2.5 shrink-0 group select-none"
          >
            <Abha3DOrb size="sm" state="IDLE" interactive={false} />
            <div className="flex flex-col justify-center">
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent font-black text-lg sm:text-xl tracking-tight leading-none">
                AABHA AI
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium text-[var(--text-secondary)] tracking-tight leading-none mt-0.5">
                Your Cognitive Companion
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs">
            {!isCaregiver ? (
              <>
                <Link
                  to="/patient"
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    location.pathname === '/patient' && !location.hash ? activeNavCls : inactiveNavCls
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/patient/games"
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    location.pathname.startsWith('/patient/games') ? activeNavCls : inactiveNavCls
                  }`}
                >
                  Activities
                </Link>
                <a
                  href="/patient#routine"
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    location.hash === '#routine' ? activeNavCls : inactiveNavCls
                  }`}
                >
                  Routine
                </a>
                <Link
                  to="/patient/memory-passport"
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    location.pathname.startsWith('/patient/memory-passport') ? activeNavCls : inactiveNavCls
                  }`}
                >
                  Memory
                </Link>
                <Link
                  to="/patient/reports"
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    location.pathname.startsWith('/patient/reports') ? activeNavCls : inactiveNavCls
                  }`}
                >
                  Progress
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/caregiver"
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    location.pathname === '/caregiver' ? activeNavCls : inactiveNavCls
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/patient/reports"
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    location.pathname.startsWith('/patient/reports') ? activeNavCls : inactiveNavCls
                  }`}
                >
                  Reports
                </Link>
                <Link
                  to="/patient/memory-passport"
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    location.pathname.startsWith('/patient/memory-passport') ? activeNavCls : inactiveNavCls
                  }`}
                >
                  Memory Bank
                </Link>
                <Link
                  to="/patient/reminders"
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    location.pathname.startsWith('/patient/reminders') ? activeNavCls : inactiveNavCls
                  }`}
                >
                  Reminders
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* RIGHT: Compact Controls (Language, Notifications, Profile, Logout) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Offline Sync State Badge */}
          <div className="hidden lg:block">
            <OfflineIndicator />
          </div>

          {/* Hackathon Tour Guide Button */}
          <button
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className="hidden sm:flex px-2.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-600 dark:text-purple-300 text-xs font-black items-center gap-1 hover:scale-105 active:scale-95 transition cursor-pointer shadow-2xs"
            title="5-Minute Hackathon Demo Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tour</span>
          </button>

          {/* 🌐 COMPACT SINGLE LANGUAGE BUTTON (Globe EN ▼) */}
          <LanguageSelector />

          {/* 🔔 Notifications Bell Button */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="btn-glass p-2 sm:p-2.5 rounded-full relative hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center border border-[var(--border)]"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-pulse" />
            </button>

            {/* Notifications Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-88 bg-[var(--bg-surface)] rounded-[22px] border border-[var(--border)] shadow-2xl p-4 z-50 animate-fade-in font-sans space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-black uppercase text-[var(--text-primary)]">Notifications</span>
                  </div>
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">✕</button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notificationsList.map(n => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-xs space-y-0.5">
                      <div className="flex items-center justify-between font-black text-[var(--text-primary)]">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 👤 Profile & Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="btn-glass p-2 sm:p-2.5 rounded-full hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center border border-[var(--border)]"
            title="Settings & Profile"
          >
            <User className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>

          {/* ↪ Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="btn-glass p-2 sm:p-2.5 rounded-full text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition cursor-pointer flex items-center justify-center border border-[var(--border)]"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
          </button>
        </div>
      </header>

      {/* Mobile Sub-bar for Offline indicator */}
      <div className="sm:hidden px-3.5 py-1 bg-[var(--bg-surface-secondary)] border-b border-[var(--border)] flex justify-between items-center text-[10px]">
        <OfflineIndicator />
        <span className="text-[var(--text-secondary)] font-mono font-bold">
          ID: {user?.patientId || 'PAT-DEMO-000001'}
        </span>
      </div>

      {/* ─── 2. MAIN CONTENT AREA ───────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 md:py-8 pb-32 md:pb-12 overflow-x-hidden min-w-0">
        <Outlet />
      </main>

      {/* ─── 3. FIXED MOBILE BOTTOM NAVIGATION ──────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 backdrop-blur-2xl px-3 py-2 flex justify-around items-center z-40 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.08)] border-t border-[var(--border)]"
        style={{ backgroundColor: isDark ? 'rgba(13,20,38,0.96)' : 'rgba(255,255,255,0.96)' }}
      >
        <Link
          to="/patient"
          className={`py-1 px-3 rounded-2xl flex flex-col items-center transition-all ${
            location.pathname === '/patient' && !location.hash
              ? 'text-purple-600 dark:text-purple-400 font-black scale-105'
              : 'text-[var(--text-muted)] font-bold'
          }`}
        >
          <span className="text-xl leading-none mb-1">🏠</span>
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        <Link
          to="/patient/games"
          className={`py-1 px-3 rounded-2xl flex flex-col items-center transition-all ${
            location.pathname.startsWith('/patient/games')
              ? 'text-purple-600 dark:text-purple-400 font-black scale-105'
              : 'text-[var(--text-muted)] font-bold'
          }`}
        >
          <span className="text-xl leading-none mb-1">🎮</span>
          <span className="text-[10px] tracking-tight">Activities</span>
        </Link>

        <a
          href="/patient#routine"
          className={`py-1 px-3 rounded-2xl flex flex-col items-center transition-all ${
            location.hash === '#routine'
              ? 'text-purple-600 dark:text-purple-400 font-black scale-105'
              : 'text-[var(--text-muted)] font-bold'
          }`}
        >
          <span className="text-xl leading-none mb-1">📅</span>
          <span className="text-[10px] tracking-tight">Routine</span>
        </a>

        <Link
          to="/patient/memory-passport"
          className={`py-1 px-3 rounded-2xl flex flex-col items-center transition-all ${
            location.pathname.startsWith('/patient/memory-passport')
              ? 'text-purple-600 dark:text-purple-400 font-black scale-105'
              : 'text-[var(--text-muted)] font-bold'
          }`}
        >
          <span className="text-xl leading-none mb-1">📖</span>
          <span className="text-[10px] tracking-tight">Memory</span>
        </Link>

        <Link
          to="/patient/reports"
          className={`py-1 px-3 rounded-2xl flex flex-col items-center transition-all ${
            location.pathname.startsWith('/patient/reports')
              ? 'text-purple-600 dark:text-purple-400 font-black scale-105'
              : 'text-[var(--text-muted)] font-bold'
          }`}
        >
          <span className="text-xl leading-none mb-1">📊</span>
          <span className="text-[10px] tracking-tight">Progress</span>
        </Link>
      </nav>

      {/* Settings & Demo Modals */}
      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
      {isDemoModalOpen && <HackathonDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />}
    </div>
  );
};

export default Layout;

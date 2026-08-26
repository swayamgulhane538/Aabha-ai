import React, { useState } from 'react';
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
import { Settings, Sparkles, LogOut, Compass, ShieldCheck } from 'lucide-react';

export const Layout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const isDark = useThemeStore(s => s.getResolvedTheme()) === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCaregiver = user?.role === 'CAREGIVER';

  const activeNavCls = 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-md';
  const inactiveNavCls = `text-[var(--nav-inactive-text)] hover:text-[var(--text-primary)] hover:bg-[var(--btn-glass-bg-hover)]`;

  return (
    <div className="min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden font-sans relative" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <AnimatedBackground />

      {/* Top Header */}
      <header
        className="backdrop-blur-xl px-2.5 py-2 sm:px-6 sm:py-3 shadow-md flex items-center justify-between z-30 sticky top-0 w-full min-w-0"
        style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link
            to={isCaregiver ? '/caregiver' : '/patient'}
            className="text-base sm:text-2xl font-black tracking-tight flex items-center gap-1.5 sm:gap-2.5 shrink-0"
            style={{ color: 'var(--text-primary)' }}
          >
            <Abha3DOrb size="sm" state="IDLE" interactive={false} />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent truncate">
              AABHA AI
            </span>
          </Link>

          {/* Offline Sync State Live Indicator */}
          <div className="hidden sm:block">
            <OfflineIndicator />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold">
            {!isCaregiver ? (
              <>
                <Link to="/patient" className={`px-3 py-1.5 rounded-xl transition ${location.pathname === '/patient' ? activeNavCls : inactiveNavCls}`}>
                  🏠 Home
                </Link>
                <Link to="/patient/games" className={`px-3 py-1.5 rounded-xl transition ${location.pathname.startsWith('/patient/games') ? activeNavCls : inactiveNavCls}`}>
                  🎮 Games
                </Link>
                <Link to="/patient/consultation" className={`px-3 py-1.5 rounded-xl transition ${location.pathname.startsWith('/patient/consultation') ? activeNavCls : inactiveNavCls}`}>
                  📹 Consult
                </Link>
                <Link to="/patient/reminders" className={`px-3 py-1.5 rounded-xl transition ${location.pathname.startsWith('/patient/reminders') ? activeNavCls : inactiveNavCls}`}>
                  ⏰ Alarms
                </Link>
                <Link to="/patient/reports" className={`px-3 py-1.5 rounded-xl transition ${location.pathname.startsWith('/patient/reports') ? activeNavCls : inactiveNavCls}`}>
                  📄 Reports
                </Link>
                <Link to="/patient/memory-passport" className={`px-3 py-1.5 rounded-xl transition ${location.pathname.startsWith('/patient/memory-passport') ? activeNavCls : inactiveNavCls}`}>
                  📖 Passport
                </Link>
                <Link to="/aabha" className={`px-3 py-1.5 rounded-xl transition ${location.pathname === '/aabha' ? activeNavCls : inactiveNavCls}`}>
                  🎤 Talk AABHA
                </Link>
              </>
            ) : (
              <>
                <Link to="/caregiver" className={`px-3 py-1.5 rounded-xl transition ${location.pathname === '/caregiver' ? activeNavCls : inactiveNavCls}`}>
                  📊 Overview
                </Link>
                <Link to="/patient/reports" className={`px-3 py-1.5 rounded-xl transition ${location.pathname.startsWith('/patient/reports') ? activeNavCls : inactiveNavCls}`}>
                  📄 Clinical Reports
                </Link>
                <Link to="/patient/memory-passport" className={`px-3 py-1.5 rounded-xl transition ${location.pathname.startsWith('/patient/memory-passport') ? activeNavCls : inactiveNavCls}`}>
                  📖 Memory Bank
                </Link>
                <Link to="/patient/reminders" className={`px-3 py-1.5 rounded-xl transition ${location.pathname.startsWith('/patient/reminders') ? activeNavCls : inactiveNavCls}`}>
                  ⏰ Reminders & Alarms
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Hackathon Demo Tour Guide Button */}
          <button
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-400/40 text-purple-300 text-[11px] sm:text-xs font-black flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
            title="Open 5-Minute Hackathon Demo Tour Scenario"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden md:inline">Hackathon Tour</span>
            <span className="md:hidden">Tour</span>
          </button>

          <LanguageSelector />

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="btn-glass p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition shadow-xs cursor-pointer flex items-center justify-center"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="px-2 py-1.5 sm:px-3.5 sm:py-2 font-bold text-[11px] sm:text-xs rounded-xl sm:rounded-2xl transition cursor-pointer flex items-center gap-1"
            style={{ color: 'var(--badge-rose-text)', border: '1px solid var(--badge-rose-border)', backgroundColor: 'var(--badge-rose-bg)' }}
            title={t('Logout')}
          >
            <LogOut className="w-3.5 h-3.5 sm:hidden" />
            <span className="hidden sm:inline">{t('Logout')}</span>
          </button>
        </div>
      </header>

      {/* Mobile Top Sub-bar for Offline state */}
      <div className="sm:hidden px-3 py-1 bg-[var(--bg-surface-secondary)] border-b border-[var(--border)] flex justify-between items-center text-[10px]">
        <OfflineIndicator />
        <span className="text-[var(--text-secondary)] font-mono">ID: {user?.patientId || 'PAT-DEMO-000001'}</span>
      </div>
      
      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-3.5 py-4 sm:p-6 md:p-8 pb-28 md:pb-8 overflow-x-hidden min-w-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 backdrop-blur-2xl px-2 py-1.5 flex justify-around items-center z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-[var(--border)]"
        style={{ backgroundColor: isDark ? 'rgba(13,20,38,0.95)' : 'rgba(255,255,255,0.96)' }}
      >
        <Link to="/patient" className={`py-1 px-2 rounded-xl flex flex-col items-center transition ${location.pathname === '/patient' ? 'text-emerald-500 font-black scale-105' : 'font-medium'}`} style={location.pathname === '/patient' ? {} : { color: 'var(--text-muted)' }}>
          <span className="text-lg leading-none mb-1">🏠</span>
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        <Link to="/patient/games" className={`py-1 px-2 rounded-xl flex flex-col items-center transition ${location.pathname.startsWith('/patient/games') ? 'text-emerald-500 font-black scale-105' : 'font-medium'}`} style={location.pathname.startsWith('/patient/games') ? {} : { color: 'var(--text-muted)' }}>
          <span className="text-lg leading-none mb-1">🎮</span>
          <span className="text-[10px] tracking-tight">Games</span>
        </Link>

        <Link to="/aabha" className={`py-1 px-2 rounded-xl flex flex-col items-center transition ${location.pathname === '/aabha' ? 'text-emerald-500 font-black scale-105' : 'font-medium'}`} style={location.pathname === '/aabha' ? {} : { color: 'var(--text-muted)' }}>
          <span className="text-lg leading-none mb-1">🎤</span>
          <span className="text-[10px] tracking-tight">AABHA</span>
        </Link>

        <Link to="/patient/reminders" className={`py-1 px-2 rounded-xl flex flex-col items-center transition ${location.pathname.startsWith('/patient/reminders') ? 'text-emerald-500 font-black scale-105' : 'font-medium'}`} style={location.pathname.startsWith('/patient/reminders') ? {} : { color: 'var(--text-muted)' }}>
          <span className="text-lg leading-none mb-1">⏰</span>
          <span className="text-[10px] tracking-tight">Alarms</span>
        </Link>

        <Link to="/patient/memory-passport" className={`py-1 px-2 rounded-xl flex flex-col items-center transition ${location.pathname.startsWith('/patient/memory-passport') ? 'text-emerald-500 font-black scale-105' : 'font-medium'}`} style={location.pathname.startsWith('/patient/memory-passport') ? {} : { color: 'var(--text-muted)' }}>
          <span className="text-lg leading-none mb-1">📖</span>
          <span className="text-[10px] tracking-tight">Passport</span>
        </Link>
      </nav>

      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
      {isDemoModalOpen && <HackathonDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />}
    </div>
  );
};

export default Layout;

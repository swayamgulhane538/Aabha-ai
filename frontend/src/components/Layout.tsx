import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { LanguageSelector } from './LanguageSelector';
import { SettingsModal } from './SettingsModal';
import { AnimatedBackground } from './AnimatedBackground';
import { Abha3DOrb } from './Abha3DOrb';
import { Settings, Sparkles, LogOut } from 'lucide-react';

export const Layout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const isDark = useThemeStore(s => s.getResolvedTheme()) === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeNavCls = 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-md';
  const inactiveNavCls = `text-[var(--nav-inactive-text)] hover:text-[var(--text-primary)] hover:bg-[var(--btn-glass-bg-hover)]`;

  return (
    <div className="min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden font-sans relative" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <AnimatedBackground />

      {/* Top Header — Auto-managed responsive padding & touch controls */}
      <header
        className="backdrop-blur-xl px-2.5 py-2 sm:px-6 sm:py-3.5 shadow-md flex items-center justify-between z-30 sticky top-0 w-full min-w-0"
        style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 sm:gap-5 min-w-0">
          <Link to="/patient" className="text-base sm:text-2xl font-black tracking-tight flex items-center gap-1.5 sm:gap-2.5 shrink-0" style={{ color: 'var(--text-primary)' }}>
            <Abha3DOrb size="sm" state="IDLE" interactive={false} />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent truncate">
              AABHA AI
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold">
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
            <Link to="/patient/appointments" className={`px-3 py-1.5 rounded-xl transition ${location.pathname.startsWith('/patient/appointments') ? activeNavCls : inactiveNavCls}`}>
              📅 Calendar
            </Link>
            <Link to="/patient/reports" className={`px-3 py-1.5 rounded-xl transition ${location.pathname.startsWith('/patient/reports') ? activeNavCls : inactiveNavCls}`}>
              📄 Reports
            </Link>
            <Link to="/patient/memory-passport" className={`px-3 py-1.5 rounded-xl transition ${location.pathname.startsWith('/patient/memory-passport') ? activeNavCls : inactiveNavCls}`}>
              📖 Passport
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
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
            className="px-2 py-1.5 sm:px-4 sm:py-2 font-bold text-[11px] sm:text-sm rounded-xl sm:rounded-2xl transition cursor-pointer flex items-center gap-1"
            style={{ color: 'var(--badge-rose-text)', border: '1px solid var(--badge-rose-border)', backgroundColor: 'var(--badge-rose-bg)' }}
            title={t('Logout')}
          >
            <LogOut className="w-3.5 h-3.5 sm:hidden" />
            <span className="hidden sm:inline">{t('Logout')}</span>
          </button>
        </div>
      </header>
      
      {/* Main Content Area — Responsive mobile padding */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-3.5 py-4 sm:p-6 md:p-8 pb-28 md:pb-8 overflow-x-hidden min-w-0">
        <Outlet />
      </main>

      {/* Clean Mobile Bottom Nav — Fixed, safe-area-inset aware, balanced tap items */}
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

        <Link to="/patient/consultation" className={`py-1 px-2 rounded-xl flex flex-col items-center transition ${location.pathname.startsWith('/patient/consultation') ? 'text-emerald-500 font-black scale-105' : 'font-medium'}`} style={location.pathname.startsWith('/patient/consultation') ? {} : { color: 'var(--text-muted)' }}>
          <span className="text-lg leading-none mb-1">📹</span>
          <span className="text-[10px] tracking-tight">Consult</span>
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
    </div>
  );
};

export default Layout;

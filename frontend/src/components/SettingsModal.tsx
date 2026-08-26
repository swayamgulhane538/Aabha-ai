import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore, ThemeMode } from '../stores/themeStore';
import { useAlarm } from '../context/AlarmContext';
import { ModalPortal } from './ModalPortal';
import { Globe, Volume2, Shield, User, X, Check, Bell, LogOut, Settings, Sun, Moon, Monitor } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { triggerTestAlarm } = useAlarm();
  const { theme, setTheme } = useThemeStore();

  if (!isOpen) return null;

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    localStorage.setItem('aabha_lang', lang);
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const themeOptions: { id: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { id: 'light', icon: <Sun className="w-3.5 h-3.5" />, label: '☀️ Light' },
    { id: 'system', icon: <Monitor className="w-3.5 h-3.5" />, label: '🌓 System' },
    { id: 'dark', icon: <Moon className="w-3.5 h-3.5" />, label: '🌙 Dark' },
  ];

  const handleThemeKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let nextIdx = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIdx = (idx + 1) % themeOptions.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIdx = (idx - 1 + themeOptions.length) % themeOptions.length;
    }
    if (nextIdx !== idx) {
      setTheme(themeOptions[nextIdx].id);
      const container = e.currentTarget.parentElement;
      if (container) {
        const buttons = container.querySelectorAll<HTMLButtonElement>('[role="radio"]');
        buttons[nextIdx]?.focus();
      }
    }
  };

  const headerTitle = (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-teal-500 text-white flex items-center justify-center text-base font-black shadow-md">
        ⚙️
      </div>
      <div>
        <h2 className="text-base sm:text-lg font-black leading-tight text-[var(--text-primary)]">
          Settings & Preferences
        </h2>
        <p className="text-[11px] font-medium text-[var(--text-secondary)]">
          Theme, language, audio reminders & account
        </p>
      </div>
    </div>
  );

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} title={headerTitle} maxWidth="max-w-md">
      <div className="space-y-4 font-sans text-[var(--text-primary)]">
        {/* 1. User Profile Information */}
        <div className="p-4 rounded-[20px] bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[var(--text-secondary)] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Active Account Profile</span>
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-400/30">
              {user?.role || 'PATIENT'}
            </span>
          </div>
          <div className="text-sm font-black text-[var(--text-primary)]">{user?.name || 'Mr. Arun Das'}</div>
          <div className="text-xs text-[var(--text-secondary)] font-medium">Email: {user?.email || 'arun@aabha.ai'}</div>
          <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
            Patient ID: {user?.patientId || 'PAT-DEMO-000001'}
          </div>
        </div>

        {/* 2. Theme Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase text-[var(--text-secondary)] flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Theme Appearance (थीम)</span>
          </label>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme selector">
            {themeOptions.map((opt, idx) => {
              const isActive = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={`${opt.label} theme`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setTheme(opt.id)}
                  onKeyDown={(e) => handleThemeKeyDown(e, idx)}
                  className={`py-2.5 px-2 rounded-xl font-black text-xs border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/40'
                      : 'btn-glass text-[var(--text-secondary)]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Language Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase text-[var(--text-secondary)] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Application Language (भाषा चुनें)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी (Hindi)' },
              { code: 'bn', label: 'বাংলা (Bengali)' },
              { code: 'as', label: 'অসমীয়া (Assamese)' },
              { code: 'mr', label: 'मराठी (Marathi)' }
            ].map(lang => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`py-2 px-2 rounded-xl font-black text-xs border transition cursor-pointer ${
                  i18n.language === lang.code
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/40'
                    : 'btn-glass text-[var(--text-secondary)]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Audio & Alarm Sound Test */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase text-[var(--text-secondary)] flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-teal-500" />
            <span>Medication Alarm Audio Test</span>
          </label>
          <button
            type="button"
            onClick={() => triggerTestAlarm()}
            className="w-full py-2.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Play Chime Sample (Test Speaker)</span>
          </button>
        </div>

        {/* 5. Account & Security */}
        <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 font-black text-xs flex items-center justify-center gap-2 hover:bg-rose-500/25 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </ModalPortal>
  );
};

export default SettingsModal;

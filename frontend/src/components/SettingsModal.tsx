import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore, ThemeMode } from '../stores/themeStore';
import { useAlarm } from '../context/AlarmContext';
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
      // Focus the new button
      const container = e.currentTarget.parentElement;
      if (container) {
        const buttons = container.querySelectorAll<HTMLButtonElement>('[role="radio"]');
        buttons[nextIdx]?.focus();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-6 sm:pt-10 px-4 pb-6 backdrop-blur-md animate-fade-in font-sans overflow-y-auto"
      style={{ backgroundColor: 'var(--bg-modal-overlay)' }}
    >
      <div
        className="rounded-[24px] p-5 sm:p-6 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl relative space-y-4 my-auto sm:my-0"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center text-base font-black shadow-md">
              ⚙️
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
                Settings & Preferences
              </h2>
              <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Theme, language, audio reminders, and account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition cursor-pointer"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. User Profile Information */}
        <div className="p-3.5 rounded-[18px] space-y-1" style={{ backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase" style={{ color: 'var(--text-muted)' }}>Active Account</span>
            <span className="px-2 py-0.5 text-[9px] font-black rounded-full uppercase" style={{ backgroundColor: 'var(--badge-emerald-bg)', border: '1px solid var(--badge-emerald-border)', color: 'var(--badge-emerald-text)' }}>
              {user?.role || 'PATIENT'}
            </span>
          </div>
          <h3 className="text-base font-black leading-snug" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Demo Patient'}</h3>
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{user?.email || 'demo.patient@aabha.ai'}</p>
          {user?.patientId && (
            <p className="text-xs font-mono font-black text-emerald-500 pt-0.5">
              Permanent ID: {user.patientId}
            </p>
          )}
        </div>

        {/* 2. Theme Appearance */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Theme Appearance</span>
          </label>
          <div
            className="grid grid-cols-3 gap-2"
            role="radiogroup"
            aria-label="Theme selection"
          >
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
                  className={`py-2.5 px-2 rounded-xl font-black text-xs border transition cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                      : ''
                  }`}
                  style={isActive ? {} : {
                    backgroundColor: 'var(--btn-glass-bg)',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Language Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>Application Language (भाषा चुनें)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'hi', label: 'हिंदी (Hindi)' },
              { code: 'mr', label: 'मराठी (Marathi)' },
              { code: 'en', label: 'English' }
            ].map(lang => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`py-2 px-2 rounded-xl font-black text-xs border transition cursor-pointer ${
                  i18n.language === lang.code
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                    : ''
                }`}
                style={i18n.language === lang.code ? {} : {
                  backgroundColor: 'var(--btn-glass-bg)',
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Audio & Alarm Sound Test */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Medication Reminders Audio</span>
          </label>
          <button
            type="button"
            onClick={() => triggerTestAlarm()}
            className="btn-glass w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-emerald-500" />
            <span>Test Sound & Chime Notification</span>
          </button>
        </div>

        {/* 5. Switch Account / Sign Out */}
        <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
            style={{
              backgroundColor: 'var(--badge-rose-bg)',
              border: '1px solid var(--badge-rose-border)',
              color: 'var(--badge-rose-text)',
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out from Device</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

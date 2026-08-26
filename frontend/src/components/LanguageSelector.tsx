import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', short: 'EN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', short: 'हिं' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', short: 'मरा' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', short: 'বাং' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', short: 'অস' }
];

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangCode = i18n.language || 'en';
  const currentLang =
    LANGUAGES.find(l => l.code === currentLangCode) ||
    LANGUAGES.find(l => l.code === 'en') ||
    LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: string) => {
    const clean = code.split('-')[0].toLowerCase();
    i18n.changeLanguage(clean);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', clean);
      localStorage.setItem('aabha_lang', clean);
      document.documentElement.lang = clean;
      window.dispatchEvent(new CustomEvent('aabha_language_changed', { detail: { lang: clean } }));
    }
    setIsOpen(false); // Automatically close dropdown
  };

  return (
    <div ref={dropdownRef} className={`relative z-50 inline-block text-left select-none ${className}`}>
      {/* Compact Single Language Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="btn-glass px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-xs font-bold flex items-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-95 transition cursor-pointer shadow-xs border border-[var(--border)] text-[var(--text-primary)]"
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400 shrink-0" />
        <span className="hidden sm:inline text-xs font-bold">
          {currentLang.native}
        </span>
        <span className="sm:hidden text-xs font-bold">
          {currentLang.short}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-[var(--text-secondary)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Clean Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Language selection"
          className="absolute right-0 mt-2 w-48 sm:w-56 bg-[var(--bg-surface)] rounded-[20px] border border-[var(--border)] shadow-2xl py-2 z-[99999] animate-fade-in font-sans"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          {/* Header */}
          <div className="px-3.5 py-2 border-b border-[var(--border)] flex items-center justify-between text-[11px] font-black uppercase text-[var(--text-secondary)] tracking-wider">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{t('Change Language')}</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] lowercase font-mono">5 languages</span>
          </div>

          {/* Options */}
          <div className="py-1 px-1.5 space-y-0.5">
            {LANGUAGES.map(lang => {
              const isSelected = currentLang.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 font-black border border-purple-400/30'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.native}</span>
                    <span className="text-[11px] text-[var(--text-secondary)] font-normal">
                      ({lang.label})
                    </span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

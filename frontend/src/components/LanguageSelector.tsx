import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'हिं' },
  { code: 'mr', label: 'मराठी', short: 'मरा' }
];

interface LanguageSelectorProps {
  className?: string;
  showIcon?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  showIcon = true
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', code);
      localStorage.setItem('aabha_lang', code);
    }
  };

  return (
    <div
      role="group"
      aria-label="Language Selector"
      className={`inline-flex items-center gap-0.5 sm:gap-1 bg-[var(--bg-surface)] backdrop-blur-xl p-0.5 sm:p-1 rounded-full border border-[var(--border)] shadow-md select-none shrink-0 ${className}`}
    >
      {showIcon && (
        <span className="hidden sm:flex pl-2 pr-0.5 text-[var(--text-secondary)] items-center justify-center shrink-0">
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
        </span>
      )}

      {LANGUAGES.map((lang) => {
        const isSelected = currentLang === lang.code || (lang.code === 'en' && !['hi', 'mr'].includes(currentLang));
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
              isSelected
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm ring-1 ring-emerald-400/50 scale-100'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] active:scale-95'
            }`}
          >
            <span className="inline sm:hidden">{lang.short}</span>
            <span className="hidden sm:inline">{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSelector;

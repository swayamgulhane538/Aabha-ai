import React from 'react';
import { useAccessibilityStore, FontSizeOption } from '../stores/accessibilityStore';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  Type,
  Sun,
  Hand,
  Volume2,
  Subtitles,
  Globe,
  X,
  Sparkles,
  Check
} from 'lucide-react';

export const AccessibilityToolbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    fontSize,
    highContrast,
    oneHandMode,
    subtitles,
    activeSubtitleText,
    isOpen,
    setFontSize,
    toggleHighContrast,
    toggleOneHandMode,
    toggleSubtitles,
    setIsOpen
  } = useAccessibilityStore();

  const handleSpeechReadPage = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const pageText = document.body.innerText.slice(0, 400); // Read top summary
      const utterance = new SpeechSynthesisUtterance(pageText);
      utterance.lang = i18n.language === 'mr' ? 'mr-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* ─── 1. FLOATING ACCESSIBILITY QUICK TRIGGER ──────────────────────── */}
      <div className="fixed top-24 right-4 z-40 pointer-events-auto select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 backdrop-blur-xl rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition flex items-center gap-2 group cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
          title="Accessibility & Assistive Settings"
          aria-label="Open accessibility tools"
        >
          <span className="text-xl">♿</span>
          <span className="hidden md:inline font-black text-xs text-emerald-500">
            Assist Mode
          </span>
        </button>
      </div>

      {/* ─── 2. LIVE SUBTITLES & AUDIO CAPTIONS OVERLAY ──────────────────── */}
      {subtitles && activeSubtitleText && (
        <div
          role="region"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] border border-emerald-400/40 p-3 rounded-2xl text-center text-xs sm:text-sm font-bold shadow-2xl animate-fade-in"
          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
        >
          <span className="text-emerald-500 font-mono text-[10px] uppercase block mb-0.5 font-black">
            [Audio Subtitle]
          </span>
          "{activeSubtitleText}"
        </div>
      )}

      {/* ─── 3. ACCESSIBILITY MODAL DRAWER ────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-modal-overlay)' }}
        >
          <div
            className="rounded-[24px] p-5 sm:p-7 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-4 sm:space-y-5 relative my-auto"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">♿</span>
                <div>
                  <h3 className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>Accessibility Assistant</h3>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Customized for visual, motor & cognitive comfort
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl transition cursor-pointer"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Font Size Scaling */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Type className="w-3.5 h-3.5 text-emerald-500" />
                <span>Text Size (फ़ॉन्ट आकार)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'A (Normal)' },
                  { id: 'large', label: 'A+ (Large)' },
                  { id: 'extra-large', label: 'A++ (Extra)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFontSize(opt.id as FontSizeOption)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      fontSize === opt.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-md'
                        : ''
                    }`}
                    style={fontSize === opt.id ? {} : {
                      backgroundColor: 'var(--btn-glass-bg)',
                      color: 'var(--text-secondary)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. High Contrast Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <Sun className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>High Contrast Mode</div>
                  <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Stark high-clarity neon borders</div>
                </div>
              </div>
              <button
                onClick={toggleHighContrast}
                className={`w-12 h-7 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  highContrast ? 'bg-emerald-500' : ''
                }`}
                style={highContrast ? {} : { backgroundColor: 'var(--btn-glass-bg)', border: '1px solid var(--border)' }}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                    highContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3. One-Hand Ergonomic Reach Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <Hand className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>One-Hand Mode (एक हाथ मोड)</div>
                  <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Positions buttons closer to lower thumb reach</div>
                </div>
              </div>
              <button
                onClick={toggleOneHandMode}
                className={`w-12 h-7 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  oneHandMode ? 'bg-emerald-500' : ''
                }`}
                style={oneHandMode ? {} : { backgroundColor: 'var(--btn-glass-bg)', border: '1px solid var(--border)' }}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                    oneHandMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 4. Subtitles & Audio Captions */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <Subtitles className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Live Subtitles & Captions</div>
                  <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Displays on-screen text for all voice responses</div>
                </div>
              </div>
              <button
                onClick={toggleSubtitles}
                className={`w-12 h-7 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  subtitles ? 'bg-emerald-500' : ''
                }`}
                style={subtitles ? {} : { backgroundColor: 'var(--btn-glass-bg)', border: '1px solid var(--border)' }}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                    subtitles ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 5. Screen Read-Aloud */}
            <button
              onClick={handleSpeechReadPage}
              className="btn-glass w-full py-3 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-emerald-500" />
              <span>Read Aloud Page Summary (पेज पढ़ें)</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityToolbar;

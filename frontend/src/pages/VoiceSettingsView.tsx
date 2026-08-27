import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, Smartphone, Sparkles, Sliders, Check, RotateCcw, Play, Music, Shield } from 'lucide-react';
import { useVoiceSettingsStore } from '../stores/voiceSettingsStore';
import { speechService } from '../services/speechService';
import { alarmAudioService } from '../services/alarmAudioService';

export default function VoiceSettingsView() {
  const { t, i18n } = useTranslation();
  const {
    language,
    speechSpeed,
    volume,
    vibration,
    selectedVoiceURI,
    isVoiceAlarmEnabled,
    setLanguage,
    setSpeechSpeed,
    setVolume,
    setVibration,
    setSelectedVoiceURI,
    setVoiceAlarmEnabled
  } = useVoiceSettingsStore();

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const load = () => {
        const voices = window.speechSynthesis.getVoices() || [];
        setAvailableVoices(voices);
      };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
  }, []);

  const handleTestVoice = () => {
    setIsPlayingTest(true);
    let sample = 'Hello! This is a test of AABHA AI spoken voice assistance.';
    if (language === 'hi') {
      sample = 'नमस्ते! मैं आभा हूँ। यह आपकी वॉयस रिमाइंडर और अलार्म की बोलती आवाज़ का परीक्षण है।';
    } else if (language === 'mr') {
      sample = 'नमस्कार! मी आभा आहे. ही तुमच्या स्मरणपत्रांच्या बोलणाऱ्या आवाजाची चाचणी आहे.';
    }

    // Play soft pre-chime then speak sample
    alarmAudioService.playMelody('temple_bell', 0.4);
    setTimeout(() => {
      speechService.speak(sample, language, () => {
        setIsPlayingTest(false);
      });
    }, 400);

    if (vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([200, 100, 200]); } catch {}
    }
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-32 font-sans text-[var(--text-primary)]">
      {/* Top Header */}
      <div className="card-3d bg-gradient-to-br from-emerald-950/40 via-[var(--card-bg-inline)] to-teal-950/30 backdrop-blur-xl p-6 sm:p-8 rounded-[28px] border-2 border-emerald-500/30 shadow-2xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Voice & Audio Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] flex items-center gap-3">
          <span>🗣️</span> {language === 'mr' ? 'आवाज आणि उच्चार सेटिंग्ज' : language === 'hi' ? 'वॉयस एवं स्पीच सेटिंग्स' : 'Voice & Speech Settings'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-xl leading-relaxed">
          Customize spoken reminder language, speech playback speed, volume level, and device vibration alerts.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 sm:p-8 rounded-[28px] border border-[var(--card-border-inline)] shadow-xl space-y-6">
        {/* 1. Language Selection */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
            <span>🌐</span> Default Voice Language
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'hi', label: '🇮🇳 हिन्दी (Hindi)' },
              { id: 'mr', label: '🇮🇳 मराठी (Marathi)' },
              { id: 'en', label: '🌐 English' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLanguage(item.id as any)}
                className={`py-3 px-3 rounded-2xl text-xs font-black border transition cursor-pointer ${
                  language === item.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-md'
                    : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Speech Playback Speed */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
            <span>⚡</span> Speech Speed
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'slow', label: '🐢 Slow (0.8x)', desc: 'Easier for seniors' },
              { id: 'normal', label: '✨ Normal (1.0x)', desc: 'Standard clarity' },
              { id: 'fast', label: '🚀 Fast (1.2x)', desc: 'Quick pace' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSpeechSpeed(item.id as any)}
                className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                  speechSpeed === item.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-md'
                    : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
                }`}
              >
                <div className="text-xs font-black">{item.label}</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Voice Volume Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" /> Speech Volume
            </label>
            <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer h-2 bg-[var(--bg-surface-secondary)] rounded-lg"
          />
        </div>

        {/* 4. Vibration Alert Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-xl">
              📳
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">Haptic Vibration Alert</h4>
              <p className="text-[11px] text-[var(--text-secondary)]">Vibrate device on reminder alarms</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={vibration}
            onChange={(e) => setVibration(e.target.checked)}
            className="w-6 h-6 accent-emerald-400 rounded cursor-pointer"
          />
        </div>

        {/* 5. Device Voice Selection (If Available) */}
        {availableVoices.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-black text-[var(--text-primary)] block">
              Device Synthesizer Voice
            </label>
            <select
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl p-3 text-xs font-bold outline-none"
            >
              <option value="">Auto (Google Neural TTS / Native)</option>
              {availableVoices.map((v, i) => (
                <option key={i} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 6. Test Voice & Save Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={handleTestVoice}
            className="w-full sm:flex-1 btn-glass py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 text-emerald-300 hover:text-emerald-200 cursor-pointer shadow-md"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>{isPlayingTest ? 'Testing Voice...' : '🔊 Test Voice Aloud'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:flex-1 btn-glow py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-xl"
          >
            <Check className="w-4 h-4" />
            <span>{savedSuccess ? '✓ Settings Saved' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

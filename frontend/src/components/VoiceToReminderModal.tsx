import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Check, Edit3, Volume2, Sparkles, X, Clock, Calendar, AlertCircle } from 'lucide-react';
import { speechService } from '../services/speechService';
import { AIRoutineCommander, ParsedVoiceCommand } from '../services/aiRoutineCommander';
import { api } from '../services/api';
import { Abha3DOrb, OrbState } from './Abha3DOrb';
import { useVoiceSettingsStore } from '../stores/voiceSettingsStore';

interface VoiceToReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReminderCreated?: () => void;
}

export const VoiceToReminderModal: React.FC<VoiceToReminderModalProps> = ({
  isOpen,
  onClose,
  onReminderCreated
}) => {
  const { t, i18n } = useTranslation();
  const { language: storeLang, vibration } = useVoiceSettingsStore();

  const [state, setState] = useState<OrbState>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState<'hi' | 'mr' | 'en'>(storeLang || 'hi');
  const [parsedData, setParsedData] = useState<ParsedVoiceCommand | null>(null);
  const [step, setStep] = useState<'LISTENING' | 'CONFIRM' | 'EDIT' | 'SUCCESS'>('LISTENING');
  const [errorMsg, setErrorMsg] = useState('');

  // Editable fields when user clicks [Edit]
  const [editTitle, setEditTitle] = useState('Medicine');
  const [editTime, setEditTime] = useState('08:00');
  const [editDate, setEditDate] = useState(new Date().toISOString().slice(0, 10));
  const [editVoiceMsg, setEditVoiceMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('LISTENING');
      setTranscript('');
      setParsedData(null);
      setErrorMsg('');
      setTimeout(() => startListening(), 400);
    } else {
      speechService.stopListening();
      speechService.stopSpeaking();
    }
  }, [isOpen]);

  const startListening = () => {
    setErrorMsg('');
    setTranscript('');
    setState('LISTENING');

    speechService.startListening(
      (text: string) => {
        setTranscript(text);
        if (text.trim()) {
          processSpokenCommand(text.trim());
        }
      },
      (err: any) => {
        if (err !== 'no-speech') {
          setErrorMsg('Microphone error or permission denied. You can type below.');
          setState('ERROR');
        } else {
          setState('IDLE');
        }
      },
      language
    );
  };

  const stopListening = () => {
    speechService.stopListening();
    setState('IDLE');
  };

  const processSpokenCommand = (text: string) => {
    setState('THINKING');
    const parsed = AIRoutineCommander.parseCommand(text, language);

    if (parsed.intent === 'CLARIFY' && parsed.needsClarification) {
      setParsedData(parsed);
      const q = parsed.clarificationQuestion || 'Sure. What time should I remind you?';
      speechService.speak(q, language, () => {
        setState('LISTENING');
        startListening();
      });
      return;
    }

    // Extracted complete reminder!
    const time = parsed.time || '08:00';
    const date = parsed.date || new Date().toISOString().slice(0, 10);
    const title = parsed.title || 'Medicine';
    const voiceMsg = parsed.voiceMessage || `${title} lene ka time ho gaya hai`;

    setParsedData(parsed);
    setEditTitle(title);
    setEditTime(time);
    setEditDate(date);
    setEditVoiceMsg(voiceMsg);
    setStep('CONFIRM');
    setState('IDLE');

    // Speak Confirmation Prompt out loud
    const [h, m] = time.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10));
    const time12h = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let confirmPrompt = `Set a reminder for ${title} at ${time12h}?`;
    if (language === 'hi') {
      confirmPrompt = `${time12h} बजे ${title} का रिमाइंडर सेट करूँ?`;
    } else if (language === 'mr') {
      confirmPrompt = `${time12h} वाजता ${title} चे स्मरणपत्र सेट करू का?`;
    }

    speechService.speak(confirmPrompt, language);
  };

  const handleConfirmSave = async () => {
    const time = editTime || '08:00';
    const [hours, mins] = time.split(':');
    const schedDate = new Date();
    if (editDate) {
      const [y, m, d] = editDate.split('-');
      schedDate.setFullYear(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    }
    schedDate.setHours(parseInt(hours, 10), parseInt(mins, 10), 0, 0);

    const payload = {
      title: editTitle,
      type: parsedData?.type || 'MEDICINE',
      description: editVoiceMsg || `Voice reminder set via voice command`,
      scheduledAt: schedDate.toISOString(),
      recurrence: parsedData?.recurrence || 'DAILY',
      metadata: {
        isVoiceAlarm: true,
        voiceMessage: editVoiceMsg || `${editTitle} lene ka time ho gaya hai`,
        voiceLanguage: language,
        voiceVolume: 1.0,
        vibration: vibration !== false,
        ringtone: 'temple_bell',
        enabled: true
      }
    };

    try {
      await api.post('/reminders', payload);
    } catch {}

    setStep('SUCCESS');

    const time12h = schedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let successSpeech = `Done. I'll remind you at ${time12h}.`;
    if (language === 'hi') {
      successSpeech = `ठीक है! मैंने ${time12h} बजे का रिमाइंडर सेट कर दिया है।`;
    } else if (language === 'mr') {
      successSpeech = `नक्कीच! मी ${time12h} वाजताचे स्मरणपत्र सेट केले आहे.`;
    }

    speechService.speak(successSpeech, language);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aabha-reminders-updated'));
    }

    if (onReminderCreated) onReminderCreated();

    setTimeout(() => {
      onClose();
    }, 2400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="card-3d bg-[var(--card-bg-inline)] border-2 border-emerald-500/40 rounded-[28px] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center text-xl shrink-0">
              🎤
            </div>
            <div>
              <h3 className="text-lg font-black text-[var(--text-primary)]">Voice → Reminder</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Speak naturally in Hindi, Marathi, or English
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-xs font-black text-[var(--text-primary)] cursor-pointer"
            >
              <option value="hi">🇮🇳 हिन्दी</option>
              <option value="mr">🇮🇳 मराठी</option>
              <option value="en">🌐 English</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── STEP 1: LISTENING / SPEAKING HERO ────────────────────────── */}
        {step === 'LISTENING' && (
          <div className="space-y-4 text-center py-2">
            <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-b from-emerald-500/10 via-[var(--bg-surface-secondary)] to-transparent rounded-3xl border border-emerald-500/20">
              <Abha3DOrb
                state={state}
                size="hero"
                interactive={true}
                onClick={() => {
                  if (state === 'LISTENING') stopListening();
                  else startListening();
                }}
              />

              <div className="mt-3">
                <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full animate-pulse shadow-sm">
                  {state === 'LISTENING' ? '🔴 Listening... Speak clearly' : '🎙️ Tap orb or say: "Kal subah 8 baje medicine"'}
                </span>
              </div>

              {transcript && (
                <div className="mt-3 text-xs sm:text-sm font-bold text-emerald-300 italic bg-[var(--bg-surface)] px-4 py-2 rounded-xl border border-emerald-500/30 max-w-md mx-auto">
                  "{transcript}"
                </div>
              )}
            </div>

            {/* Quick Sample Cues */}
            <div className="space-y-1.5 text-left pt-1">
              <span className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                Try saying:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-medium text-emerald-300">
                <button
                  type="button"
                  onClick={() => processSpokenCommand('Kal subah 8 baje medicine yaad dilana')}
                  className="p-2 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 border border-[var(--border)] text-left cursor-pointer transition"
                >
                  💬 "Kal subah 8 baje medicine"
                </button>
                <button
                  type="button"
                  onClick={() => processSpokenCommand('Roz 7 baje exercise yaad dilana')}
                  className="p-2 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 border border-[var(--border)] text-left cursor-pointer transition"
                >
                  💬 "Roz 7 baje exercise"
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: CONFIRMATION PROMPT ─────────────────────────────── */}
        {step === 'CONFIRM' && (
          <div className="space-y-4 py-2 animate-fade-in">
            <div className="p-5 rounded-2xl bg-[var(--bg-surface-secondary)] border-2 border-emerald-400/50 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Interpreted Reminder
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase block">Title</span>
                  <span className="text-sm font-black text-[var(--text-primary)]">{editTitle}</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase block">Time</span>
                  <span className="text-sm font-black text-emerald-300">{editTime}</span>
                </div>
              </div>

              {editVoiceMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-left">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Spoken Voice:
                  </span>
                  <span className="text-xs font-bold text-[var(--text-primary)] italic">"{editVoiceMsg}"</span>
                </div>
              )}

              {/* Confirmation Question Header */}
              <div className="text-center pt-2">
                <p className="text-sm font-black text-emerald-300">
                  {language === 'hi'
                    ? `कल ${editTime} बजे "${editTitle}" का रिमाइंडर सेट करें?`
                    : language === 'mr'
                    ? `उद्या ${editTime} वाजता "${editTitle}" चे स्मरणपत्र सेट करू का?`
                    : `Set reminder for ${editTitle} tomorrow at ${editTime}?`}
                </p>
              </div>
            </div>

            {/* Confirmation Buttons: [Confirm] [Edit] */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStep('EDIT')}
                className="btn-glass py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-[var(--text-secondary)] hover:text-white cursor-pointer"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>

              <button
                type="button"
                onClick={handleConfirmSave}
                className="btn-glow py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Check className="w-4 h-4" /> Confirm
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: EDIT FORM IF USER WANTS TO TWEAK ────────────────── */}
        {step === 'EDIT' && (
          <div className="space-y-3 py-2 animate-fade-in text-left">
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl px-3 py-2 text-xs font-bold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Time</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={e => setEditTime(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl px-3 py-2 text-xs font-black outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl px-3 py-2 text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Voice Message</label>
              <textarea
                rows={2}
                value={editVoiceMsg}
                onChange={e => setEditVoiceMsg(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('CONFIRM')}
                className="btn-glass py-2.5 text-xs font-bold rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="btn-glow py-2.5 text-xs font-black rounded-xl"
              >
                Save Reminder
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: SUCCESS CONFIRMATION ────────────────────────────── */}
        {step === 'SUCCESS' && (
          <div className="space-y-3 py-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-xl animate-bounce">
              ✓
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)]">Reminder Set Successfully!</h3>
            <p className="text-xs font-medium text-emerald-300">
              AABHA will speak your reminder aloud at {editTime}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Mic, Check, Volume2, Clock, Zap, X, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { speechService } from '../services/speechService';
import { alarmAudioService } from '../services/alarmAudioService';
import { Abha3DOrb } from './Abha3DOrb';

interface HackathonInteractiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HackathonInteractiveDemoModal: React.FC<HackathonInteractiveDemoModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [countdown, setCountdown] = useState(3);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCountdown(3);
    } else {
      speechService.stopSpeaking();
      alarmAudioService.stop();
    }
  }, [isOpen]);

  // Step 4 Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (step === 4) {
      setCountdown(3);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep(5);
            playDemoAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step]);

  const playDemoAlarm = () => {
    setIsSpeaking(true);
    // Soft pre-chime then spoken voice
    alarmAudioService.playMelody('temple_bell', 0.5);
    setTimeout(() => {
      let voiceMsg = 'Reminder. Medicine lene ka time ho gaya hai. Kripya apni dawa le lijiye.';
      if (lang === 'mr') {
        voiceMsg = 'स्मरणपत्र: औषध घेण्याची वेळ झाली आहे. कृपया औषध घ्या.';
      } else if (lang === 'en') {
        voiceMsg = 'Reminder: It is time to take your morning medicine.';
      }
      speechService.speak(voiceMsg, lang, () => {
        setIsSpeaking(false);
      });
    }, 450);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([300, 150, 300]); } catch {}
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="card-3d bg-[var(--card-bg-inline)] border-2 border-amber-400/60 rounded-[28px] max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              DEMO MODE
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
              Interactive Hackathon Showcase
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── STEP 1: USER SPEAKS OR TAPS VOICE COMMAND ─────────────────── */}
        {step === 1 && (
          <div className="space-y-4 text-center py-2 animate-fade-in">
            <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-b from-amber-500/10 via-[var(--bg-surface-secondary)] to-transparent rounded-3xl border border-amber-400/30">
              <Abha3DOrb state="LISTENING" size="hero" interactive={false} />
              <p className="text-xs font-black uppercase tracking-wider text-amber-300 mt-3 animate-pulse">
                Step 1: Voice-to-Reminder Command
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-left space-y-1.5">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">Spoken Command:</span>
              <p className="text-sm font-black text-emerald-300 italic">
                "{lang === 'mr' ? 'उद्या 8 वाजता औषध आठवण करून द्या' : 'Kal 8 baje medicine yaad dilana'}"
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-glow w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Process Voice Command →</span>
            </button>
          </div>
        )}

        {/* ─── STEP 2: INTERPRETED INFORMATION ─────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4 py-2 animate-fade-in text-left">
            <div className="p-5 rounded-2xl bg-[var(--bg-surface-secondary)] border-2 border-emerald-400/50 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Step 2: Interpreted Intent & Entities
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase block">Title</span>
                  <span className="text-sm font-black text-[var(--text-primary)]">💊 Medicine</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase block">Time</span>
                  <span className="text-sm font-black text-emerald-300">08:00 AM (Tomorrow)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Generated Spoken Voice:</span>
                <span className="text-xs font-bold text-[var(--text-primary)] italic">
                  "{lang === 'mr' ? 'स्मरणपत्र: औषध घेण्याची वेळ झाली आहे.' : 'Reminder. Medicine lene ka time ho gaya hai.'}"
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="btn-glow w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Step 3: Confirm Reminder (Yes) →</span>
            </button>
          </div>
        )}

        {/* ─── STEP 3: DASHBOARD UPDATE PREVIEW ─────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4 py-2 animate-fade-in text-center">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border-2 border-emerald-400/40 text-left space-y-2">
              <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Reminder Created on Dashboard
              </span>
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-[var(--text-primary)]">💊 Medicine</h4>
                  <p className="text-xs text-emerald-300 font-bold">⏰ Tomorrow at 08:00 AM • 🔊 Voice Enabled</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black rounded-full">
                  Active
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 w-full shadow-xl cursor-pointer"
            >
              <Zap className="w-4 h-4 animate-bounce" />
              <span>Trigger Simulated Live Alarm Countdown (3s) →</span>
            </button>
          </div>
        )}

        {/* ─── STEP 4: COUNTDOWN ───────────────────────────────────────── */}
        {step === 4 && (
          <div className="py-8 text-center space-y-4 animate-fade-in">
            <div className="w-24 h-24 rounded-3xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 font-black text-5xl flex items-center justify-center mx-auto shadow-2xl animate-pulse">
              {countdown}
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)]">Preparing Voice Alarm...</h3>
              <p className="text-xs text-amber-300 font-bold mt-1">
                Live spoken TTS and soft pre-chime will trigger in {countdown}s
              </p>
            </div>
          </div>
        )}

        {/* ─── STEP 5: ALARM TRIGGERED & COMPLETION CELEBRATION ─────────── */}
        {step === 5 && (
          <div className="space-y-4 py-2 animate-fade-in text-center">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-500/20 via-emerald-500/10 to-teal-500/20 border-2 border-emerald-400 shadow-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-wider animate-pulse">
                <Volume2 className="w-4 h-4" /> Alarm Ringing & Speaking Now!
              </div>

              <div className="text-4xl">💊</div>
              <h3 className="text-2xl font-black text-[var(--text-primary)]">10:00 AM — Medicine</h3>
              <p className="text-sm font-bold text-emerald-300 italic px-4">
                "{lang === 'mr' ? 'स्मरणपत्र: औषध घेण्याची वेळ झाली आहे.' : 'Reminder. Medicine lene ka time ho gaya hai.'}"
              </p>

              <button
                type="button"
                onClick={() => {
                  speechService.stopSpeaking();
                  onClose();
                }}
                className="btn-glow w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-xl mt-3"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>[Complete] Finish Demo Successfully ✓</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

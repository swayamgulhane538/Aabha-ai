import React from 'react';
import { useTranslation } from 'react-i18next';
import { RingtoneId } from '../services/alarmAudioService';
import { Volume2, CheckCircle2, Clock, Sparkles, Smartphone, RotateCcw } from 'lucide-react';
import { ModalPortal } from './ModalPortal';

export interface ActiveAlarmData {
  id: string;
  title: string;
  type: string;
  description?: string;
  ringtone?: RingtoneId;
  isVoiceAlarm?: boolean;
  voiceMessage?: string;
  voiceLanguage?: string;
  voiceVolume?: number;
  vibration?: boolean;
  isDemoMode?: boolean;
  recurrence?: string;
}

interface AlarmRingingModalProps {
  alarm: ActiveAlarmData | null;
  onDismiss: (id: string) => void;
  onSnooze: (id: string) => void;
  onReSpeak?: () => void;
}

export const AlarmRingingModal: React.FC<AlarmRingingModalProps> = ({
  alarm,
  onDismiss,
  onSnooze,
  onReSpeak
}) => {
  const { t } = useTranslation();

  if (!alarm) return null;

  const getEmoji = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'MEDICINE': return '💊';
      case 'WATER': return '💧';
      case 'MEAL': return '🍽️';
      case 'ACTIVITY': return '🧠';
      case 'APPOINTMENT': return '🏥';
      case 'FAMILY_CALL':
      case 'CALL': return '📞';
      default: return '⏰';
    }
  };

  const getLangBadge = (lang?: string) => {
    switch (lang?.toLowerCase().split('-')[0]) {
      case 'hi': return '🇮🇳 हिन्दी (Hindi)';
      case 'mr': return '🇮🇳 मराठी (Marathi)';
      default: return '🌐 English';
    }
  };

  return (
    <ModalPortal
      isOpen={!!alarm}
      onClose={() => onDismiss(alarm.id)}
      maxWidth="max-w-lg"
      showCloseButton={false}
    >
      <div className="text-center space-y-5 font-sans py-3">
        {/* Top Badges: Ringing Status & Demo Mode */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {alarm.isDemoMode && (
            <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest animate-pulse shadow-md">
              ⚡ DEMO MODE
            </span>
          )}

          <div className="inline-flex items-center gap-2 bg-rose-500/15 text-rose-500 dark:text-rose-300 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-rose-500/30">
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>🔔 Smart Voice Alarm Ringing!</span>
          </div>

          {alarm.vibration !== false && (
            <span className="bg-purple-500/15 text-purple-400 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/30 flex items-center gap-1">
              <Smartphone className="w-3 h-3 animate-wiggle" /> 📳 Vibration ON
            </span>
          )}
        </div>

        {/* Animated Icon & Sound Waves */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-teal-500/20 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-5xl shadow-2xl">
            {getEmoji(alarm.type)}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] leading-tight">
            {alarm.title}
          </h2>
          {alarm.description && (
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mt-1.5 px-4">
              {alarm.description}
            </p>
          )}
        </div>

        {/* Spoken Voice Box */}
        {alarm.voiceMessage && (
          <div className="bg-[var(--bg-surface-secondary)] border-2 border-emerald-400/40 rounded-2xl p-4 text-left shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Spoken Voice Message:
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                {getLangBadge(alarm.voiceLanguage)}
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-relaxed italic">
              "{alarm.voiceMessage}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => onDismiss(alarm.id)}
            className="btn-glow w-full py-4 text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-xl rounded-2xl"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>I Have Taken / Done This (Dismiss)</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            {onReSpeak && (
              <button
                type="button"
                onClick={onReSpeak}
                className="btn-glass py-3 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer text-emerald-300 hover:text-emerald-200 rounded-xl"
              >
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>🔊 Re-speak Voice</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onSnooze(alarm.id)}
              className="btn-glass py-3 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Snooze (5 Mins)</span>
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AlarmRingingModal;

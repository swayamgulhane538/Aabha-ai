import React from 'react';
import { useTranslation } from 'react-i18next';
import { alarmAudioService, RingtoneId } from '../services/alarmAudioService';
import { Bell, CheckCircle2, Clock, Volume2, X } from 'lucide-react';
import { ModalPortal } from './ModalPortal';

export interface ActiveAlarmData {
  id: string;
  title: string;
  type: string;
  description?: string;
  ringtone?: RingtoneId;
}

interface AlarmRingingModalProps {
  alarm: ActiveAlarmData | null;
  onDismiss: (id: string) => void;
  onSnooze: (id: string) => void;
}

export const AlarmRingingModal: React.FC<AlarmRingingModalProps> = ({ alarm, onDismiss, onSnooze }) => {
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

  return (
    <ModalPortal
      isOpen={!!alarm}
      onClose={() => onDismiss(alarm.id)}
      maxWidth="max-w-md"
      showCloseButton={false}
    >
      <div className="text-center space-y-4 font-sans py-2">
        {/* Audio Ringing Indicator */}
        <div className="inline-flex items-center gap-2 bg-rose-500/15 text-rose-600 dark:text-rose-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse border border-rose-500/30">
          <Volume2 className="w-4 h-4 animate-bounce" />
          <span>🔔 Alarm Ringing Now!</span>
        </div>

        {/* Giant Icon */}
        <div className="w-24 h-24 mx-auto rounded-3xl bg-purple-500/15 border-2 border-purple-400/40 flex items-center justify-center text-5xl shadow-xl animate-bounce">
          {getEmoji(alarm.type)}
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] leading-tight">
            {alarm.title}
          </h2>
          {alarm.description && (
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mt-1">
              {alarm.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => onDismiss(alarm.id)}
            className="btn-glow w-full py-3.5 text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-xl"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>I Have Done This (Dismiss)</span>
          </button>

          <button
            type="button"
            onClick={() => onSnooze(alarm.id)}
            className="btn-glass w-full py-3 text-xs font-black flex items-center justify-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Clock className="w-4 h-4" />
            <span>Snooze for 10 Minutes</span>
          </button>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AlarmRingingModal;

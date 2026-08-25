import React from 'react';
import { useTranslation } from 'react-i18next';
import { alarmAudioService, RingtoneId } from '../services/alarmAudioService';
import { Bell, CheckCircle2, Clock, Volume2, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl border-4 border-primary-400 relative overflow-hidden animate-scale-up">
        {/* Glowing background ring */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Audio Ringing Indicator */}
        <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-extrabold uppercase tracking-widest mb-6 animate-pulse">
          <Volume2 className="w-5 h-5 animate-bounce" />
          <span>🔔 Alarm Ringing Now!</span>
        </div>

        {/* Giant Animated Icon */}
        <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-primary-50 border-4 border-primary-200 flex items-center justify-center text-6xl shadow-xl animate-bounce">
          {getEmoji(alarm.type)}
        </div>

        {/* Title & Description */}
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">
          {alarm.title}
        </h2>
        
        {alarm.description ? (
          <p className="text-xl text-gray-600 mb-8 leading-relaxed font-medium">
            {alarm.description}
          </p>
        ) : (
          <p className="text-xl text-primary-600 mb-8 font-semibold">
            It is time for your scheduled activity!
          </p>
        )}

        {/* Big Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => onDismiss(alarm.id)}
            className="w-full py-5 px-8 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-2xl text-2xl font-black shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 min-h-[64px]"
          >
            <CheckCircle2 className="w-8 h-8" />
            <span>I Took It / Completed (मैंने कर लिया)</span>
          </button>

          <button
            onClick={() => onSnooze(alarm.id)}
            className="w-full py-4 px-6 bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 rounded-2xl text-xl font-bold border-2 border-amber-300 transition-all flex items-center justify-center gap-2 min-h-[52px]"
          >
            <Clock className="w-6 h-6 text-amber-700" />
            <span>Snooze for 5 Mins (5 मिनट बाद याद दिलाओ)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

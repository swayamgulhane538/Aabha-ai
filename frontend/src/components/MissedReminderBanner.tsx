import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, Clock, Volume2, X } from 'lucide-react';
import { speechService } from '../services/speechService';

export interface MissedReminderItem {
  id: string;
  title: string;
  type: string;
  timeStr: string;
  voiceMessage?: string;
  voiceLanguage?: 'en' | 'hi' | 'mr';
}

interface MissedReminderBannerProps {
  missedItems: MissedReminderItem[];
  onMarkComplete: (id: string) => void;
  onReschedule: (id: string, newMinutesFromNow: number) => void;
  onDismiss: (id: string) => void;
}

export const MissedReminderBanner: React.FC<MissedReminderBannerProps> = ({
  missedItems,
  onMarkComplete,
  onReschedule,
  onDismiss
}) => {
  const { t, i18n } = useTranslation();
  const [activeSnoozeId, setActiveSnoozeId] = useState<string | null>(null);

  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  if (missedItems.length === 0) return null;

  const currentMissed = missedItems[0]; // Show highest priority missed reminder

  const handleTestVoice = () => {
    const msg = currentMissed.voiceMessage || currentMissed.title;
    speechService.speak(msg, currentMissed.voiceLanguage || lang);
  };

  return (
    <div className="card-3d bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-[var(--card-bg-inline)] border-2 border-rose-500/40 rounded-[24px] p-4 sm:p-5 shadow-2xl backdrop-blur-xl animate-fade-in font-sans space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon & Missed Text */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            ⚠️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-rose-500/20 text-rose-300 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-rose-500/30">
                Missed Reminder
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-bold">
                {currentMissed.timeStr}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] mt-0.5">
              {lang === 'mr'
                ? `तुमचे ${currentMissed.timeStr} वाजताचे "${currentMissed.title}" स्मरणपत्र चुकले होते.`
                : lang === 'hi'
                ? `आपका ${currentMissed.timeStr} का "${currentMissed.title}" रिमाइंडर छूट गया था।`
                : `Your ${currentMissed.timeStr} ${currentMissed.title} reminder was missed.`}
            </h3>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap self-end sm:self-center">
          <button
            type="button"
            onClick={handleTestVoice}
            className="btn-glass p-2.5 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200 cursor-pointer"
            title="Hear Reminder Voice"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onMarkComplete(currentMissed.id)}
            className="btn-glow px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('Mark Complete')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSnoozeId(activeSnoozeId === currentMissed.id ? null : currentMissed.id)}
            className="btn-glass px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 text-amber-300 hover:text-amber-200 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{t('Remind Me Later')}</span>
          </button>

          <button
            type="button"
            onClick={() => onDismiss(currentMissed.id)}
            className="p-2 text-[var(--text-secondary)] hover:text-white rounded-xl bg-white/5"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Snooze Selector Dropdown */}
      {activeSnoozeId === currentMissed.id && (
        <div className="pt-2 border-t border-[var(--border)] flex items-center gap-2 flex-wrap animate-fade-in">
          <span className="text-xs font-bold text-amber-300">Reschedule for:</span>
          {[
            { label: '+15 Minutes', mins: 15 },
            { label: '+30 Minutes', mins: 30 },
            { label: '+1 Hour', mins: 60 },
            { label: 'Tonight (08:00 PM)', mins: 120 }
          ].map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onReschedule(currentMissed.id, opt.mins);
                setActiveSnoozeId(null);
              }}
              className="px-3 py-1 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-amber-500/20 border border-[var(--border)] hover:border-amber-400/40 text-xs font-bold text-[var(--text-primary)] transition cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

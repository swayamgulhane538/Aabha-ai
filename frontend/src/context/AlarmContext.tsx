import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { alarmAudioService, RingtoneId } from '../services/alarmAudioService';
import { speechService } from '../services/speechService';
import { AlarmRingingModal, ActiveAlarmData } from '../components/AlarmRingingModal';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface AlarmContextType {
  activeAlarm: ActiveAlarmData | null;
  demoCountdown: number | null;
  demoAlarmData: Partial<ActiveAlarmData> | null;
  triggerVoiceAlarm: (alarmData: ActiveAlarmData) => void;
  triggerTestAlarm: (ringtone?: RingtoneId) => void;
  triggerDemoCountdown: (customData?: Partial<ActiveAlarmData>) => void;
  cancelDemoCountdown: () => void;
  dismissAlarm: (id: string) => void;
  snoozeAlarm: (id: string, minutes?: number) => void;
  speakActiveVoiceMessage: () => void;
}

const AlarmContext = createContext<AlarmContextType | null>(null);

export const AlarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarmData | null>(null);
  const [dismissedAlarms, setDismissedAlarms] = useState<Set<string>>(new Set());
  const [demoCountdown, setDemoCountdown] = useState<number | null>(null);
  const [demoAlarmData, setDemoAlarmData] = useState<Partial<ActiveAlarmData> | null>(null);
  
  const repeatSpeechTimerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);
  const activeAlarmRef = useRef<ActiveAlarmData | null>(null);

  useEffect(() => {
    activeAlarmRef.current = activeAlarm;
  }, [activeAlarm]);

  // Periodic Reminder Checker (checks every 5 seconds for due alarms)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAlarms = async () => {
      try {
        const reminders = await api.get('/reminders');
        if (!Array.isArray(reminders)) return;

        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        for (const rem of reminders) {
          if (rem.status === 'COMPLETED' || dismissedAlarms.has(rem.id)) continue;
          if (rem.metadata?.enabled === false) continue;

          if (rem.scheduledAt) {
            const scheduledDate = new Date(rem.scheduledAt);
            const schedMinutes = scheduledDate.getHours() * 60 + scheduledDate.getMinutes();
            const timeDiff = Math.abs(currentMinutes - schedMinutes);

            // Check recurrence rules
            let matchesRecurrence = false;
            const recurrence = (rem.recurrence || 'DAILY').toUpperCase();

            if (recurrence === 'ONCE') {
              const diffMs = now.getTime() - scheduledDate.getTime();
              matchesRecurrence = diffMs >= 0 && diffMs < 10 * 60 * 1000;
            } else if (recurrence === 'DAILY') {
              matchesRecurrence = timeDiff <= 1;
            } else if (recurrence === 'WEEKDAYS') {
              matchesRecurrence = currentDay >= 1 && currentDay <= 5 && timeDiff <= 1;
            } else if (Array.isArray(rem.metadata?.customDays)) {
              matchesRecurrence = rem.metadata.customDays.includes(currentDay) && timeDiff <= 1;
            } else {
              const diffMs = now.getTime() - scheduledDate.getTime();
              matchesRecurrence = diffMs >= 0 && diffMs < 10 * 60 * 1000;
            }

            if (matchesRecurrence && !activeAlarmRef.current) {
              triggerVoiceAlarm({
                id: rem.id,
                title: rem.title,
                type: rem.type,
                description: rem.description,
                isVoiceAlarm: rem.metadata?.isVoiceAlarm !== false,
                voiceMessage: rem.metadata?.voiceMessage || rem.title,
                voiceLanguage: rem.metadata?.voiceLanguage || 'hi',
                voiceVolume: rem.metadata?.voiceVolume ?? 1.0,
                vibration: rem.metadata?.vibration !== false,
                ringtone: (rem.metadata?.ringtone as RingtoneId) || 'temple_bell',
                recurrence: rem.recurrence || 'DAILY'
              });
              break;
            }
          }
        }
      } catch {}
    };

    const interval = setInterval(checkAlarms, 6000);
    return () => clearInterval(interval);
  }, [isAuthenticated, dismissedAlarms]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (repeatSpeechTimerRef.current) clearInterval(repeatSpeechTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Format and speak the reminder message
  const speakReminder = (alarm: ActiveAlarmData) => {
    const rawMsg = alarm.voiceMessage || alarm.title || 'Medicine lene ka time ho gaya hai';
    const lang = (alarm.voiceLanguage || 'hi').toLowerCase().split('-')[0];

    let spokenText = rawMsg;
    if (lang === 'hi') {
      if (!rawMsg.toLowerCase().startsWith('रिमाइंडर') && !rawMsg.toLowerCase().startsWith('reminder')) {
        spokenText = `रिमाइंडर: ${rawMsg}`;
      }
    } else if (lang === 'mr') {
      if (!rawMsg.toLowerCase().startsWith('स्मरणपत्र') && !rawMsg.toLowerCase().startsWith('reminder')) {
        spokenText = `स्मरणपत्र: ${rawMsg}`;
      }
    } else {
      if (!rawMsg.toLowerCase().startsWith('reminder')) {
        spokenText = `Reminder. ${rawMsg}`;
      }
    }

    // Play soft notification pre-chime, then voice message
    alarmAudioService.playMelody(alarm.ringtone || 'temple_bell', 0.4);
    setTimeout(() => {
      speechService.speak(spokenText, lang);
    }, 400);

    // Trigger vibration pattern if supported
    if (alarm.vibration !== false && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([400, 200, 400, 200, 600]);
      } catch {}
    }
  };

  const speakActiveVoiceMessage = () => {
    if (activeAlarm) {
      speakReminder(activeAlarm);
    }
  };

  const triggerVoiceAlarm = (alarmData: ActiveAlarmData) => {
    if (repeatSpeechTimerRef.current) clearInterval(repeatSpeechTimerRef.current);

    setActiveAlarm(alarmData);

    // Speak initial reminder
    speakReminder(alarmData);

    // Trigger Browser Notification if supported & permitted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(`⏰ AABHA Alarm: ${alarmData.title}`, {
            body: alarmData.voiceMessage || alarmData.title,
            icon: '/favicon.ico'
          });
        } catch {}
      } else if (Notification.permission !== 'denied') {
        try {
          Notification.requestPermission();
        } catch {}
      }
    }

    // Re-announce the voice message every 12 seconds until dismissed
    repeatSpeechTimerRef.current = setInterval(() => {
      if (activeAlarmRef.current) {
        speakReminder(activeAlarmRef.current);
      }
    }, 12000);
  };

  const triggerTestAlarm = (ringtone: RingtoneId = 'temple_bell') => {
    triggerVoiceAlarm({
      id: 'test-voice-alarm-' + Date.now(),
      title: '💊 Morning Blood Pressure Medicine',
      type: 'MEDICINE',
      description: 'Take 1 tablet Donepezil 5mg with warm water.',
      isVoiceAlarm: true,
      voiceMessage: 'Medicine lene ka time ho gaya hai. Kripya Donepezil 5mg paani ke saath le lijiye.',
      voiceLanguage: 'hi',
      voiceVolume: 1.0,
      vibration: true,
      ringtone
    });
  };

  const triggerDemoCountdown = (customData?: Partial<ActiveAlarmData>) => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (repeatSpeechTimerRef.current) clearInterval(repeatSpeechTimerRef.current);

    const defaultDemo: ActiveAlarmData = {
      id: 'demo-voice-alarm-' + Date.now(),
      title: '💊 Medicine Time (Demo)',
      type: 'MEDICINE',
      description: 'Scheduled demo reminder to showcase Voice Alarm TTS & Vibration.',
      isVoiceAlarm: true,
      voiceMessage: 'Medicine lene ka time ho gaya hai. Kripya apni dawa le lijiye.',
      voiceLanguage: 'hi',
      voiceVolume: 1.0,
      vibration: true,
      ringtone: 'temple_bell',
      isDemoMode: true,
      ...customData
    };

    setDemoAlarmData(defaultDemo);
    setDemoCountdown(10);

    countdownTimerRef.current = setInterval(() => {
      setDemoCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          setDemoCountdown(null);
          // Trigger the full voice alarm
          triggerVoiceAlarm(defaultDemo);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelDemoCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setDemoCountdown(null);
    setDemoAlarmData(null);
  };

  const dismissAlarm = async (id: string) => {
    if (repeatSpeechTimerRef.current) {
      clearInterval(repeatSpeechTimerRef.current);
      repeatSpeechTimerRef.current = null;
    }
    speechService.stopSpeaking();
    alarmAudioService.stop();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(0); } catch {}
    }

    setDismissedAlarms(prev => new Set(prev).add(id));
    setActiveAlarm(null);

    if (!id.startsWith('test-') && !id.startsWith('demo-')) {
      try {
        await api.put(`/reminders/${id}`, { status: 'COMPLETED' });
      } catch {}
    }
  };

  const snoozeAlarm = async (id: string, minutes: number = 5) => {
    if (repeatSpeechTimerRef.current) {
      clearInterval(repeatSpeechTimerRef.current);
      repeatSpeechTimerRef.current = null;
    }
    speechService.stopSpeaking();
    alarmAudioService.stop();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(0); } catch {}
    }

    setActiveAlarm(null);

    const snoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    if (!id.startsWith('test-') && !id.startsWith('demo-')) {
      try {
        await api.put(`/reminders/${id}`, { scheduledAt: snoozeTime });
      } catch {}
    } else {
      setTimeout(() => {
        triggerVoiceAlarm({
          id: 'snooze-test-' + Date.now(),
          title: '⏰ Snoozed Voice Alarm',
          type: 'MEDICINE',
          description: 'Snoozed voice reminder is ringing again!',
          isVoiceAlarm: true,
          voiceMessage: 'Reminder. Yeh aapka snoozed reminder hai. Kripya apna kaam pura kijiye.',
          voiceLanguage: 'hi',
          vibration: true,
          ringtone: 'gentle_flute'
        });
      }, 5000);
    }
  };

  return (
    <AlarmContext.Provider
      value={{
        activeAlarm,
        demoCountdown,
        demoAlarmData,
        triggerVoiceAlarm,
        triggerTestAlarm,
        triggerDemoCountdown,
        cancelDemoCountdown,
        dismissAlarm,
        snoozeAlarm,
        speakActiveVoiceMessage
      }}
    >
      {children}

      {/* Floating Demo Countdown Overlay */}
      {demoCountdown !== null && (
        <div className="fixed top-6 right-6 z-[99999] animate-bounce">
          <div className="bg-slate-900/95 backdrop-blur-2xl border-2 border-amber-400 text-white px-5 py-4 rounded-3xl shadow-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-black text-2xl animate-pulse">
              {demoCountdown}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  DEMO MODE
                </span>
                <span className="text-xs text-amber-300 font-bold">Voice Alarm Testing</span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Spoken reminder will play in <strong className="text-amber-400">{demoCountdown}s</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={cancelDemoCountdown}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-white/10 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* High-Contrast Ringing Modal with Voice Visualizer */}
      <AlarmRingingModal
        alarm={activeAlarm}
        onDismiss={dismissAlarm}
        onSnooze={snoozeAlarm}
        onReSpeak={speakActiveVoiceMessage}
      />
    </AlarmContext.Provider>
  );
};

export const useAlarm = () => {
  const context = useContext(AlarmContext);
  if (!context) throw new Error('useAlarm must be used within an AlarmProvider');
  return context;
};

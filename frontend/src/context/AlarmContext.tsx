import React, { createContext, useContext, useState, useEffect } from 'react';
import { alarmAudioService, RingtoneId } from '../services/alarmAudioService';
import { AlarmRingingModal, ActiveAlarmData } from '../components/AlarmRingingModal';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface AlarmContextType {
  activeAlarm: ActiveAlarmData | null;
  triggerTestAlarm: (ringtone?: RingtoneId) => void;
  dismissAlarm: (id: string) => void;
  snoozeAlarm: (id: string) => void;
}

const AlarmContext = createContext<AlarmContextType | null>(null);

export const AlarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarmData | null>(null);
  const [dismissedAlarms, setDismissedAlarms] = useState<Set<string>>(new Set());

  // Check for due reminders every 10 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAlarms = async () => {
      try {
        const reminders = await api.get('/reminders');
        if (!Array.isArray(reminders)) return;

        const now = new Date().getTime();
        for (const rem of reminders) {
          if (rem.status === 'COMPLETED' || dismissedAlarms.has(rem.id)) continue;

          if (rem.scheduledAt) {
            const scheduledTime = new Date(rem.scheduledAt).getTime();
            // If scheduled time is within past 15 minutes and hasn't been triggered
            if (scheduledTime <= now && now - scheduledTime < 15 * 60 * 1000) {
              triggerAlarm({
                id: rem.id,
                title: rem.title,
                type: rem.type,
                description: rem.description,
                ringtone: (rem.metadata?.ringtone as RingtoneId) || 'temple_bell'
              });
              break;
            }
          }
        }
      } catch {}
    };

    const interval = setInterval(checkAlarms, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated, dismissedAlarms]);

  const triggerAlarm = (alarmData: ActiveAlarmData) => {
    setActiveAlarm(alarmData);
    alarmAudioService.startAlarm(alarmData.ringtone || 'temple_bell');
  };

  const triggerTestAlarm = (ringtone: RingtoneId = 'temple_bell') => {
    triggerAlarm({
      id: 'test-alarm-' + Date.now(),
      title: '💊 Time to Take Morning Medicine!',
      type: 'MEDICINE',
      description: 'Take 1 tablet of Blood Pressure medicine with warm water.',
      ringtone
    });
  };

  const dismissAlarm = async (id: string) => {
    alarmAudioService.stop();
    setDismissedAlarms(prev => new Set(prev).add(id));
    setActiveAlarm(null);

    if (!id.startsWith('test-')) {
      try {
        await api.put(`/reminders/${id}`, { status: 'COMPLETED' });
      } catch {}
    }
  };

  const snoozeAlarm = async (id: string) => {
    alarmAudioService.stop();
    setActiveAlarm(null);

    // Snooze for 5 minutes
    const snoozeTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    if (!id.startsWith('test-')) {
      try {
        await api.put(`/reminders/${id}`, { scheduledAt: snoozeTime });
      } catch {}
    } else {
      setTimeout(() => {
        triggerTestAlarm();
      }, 5000); // For test alarm, re-trigger after 5s to show judges
    }
  };

  return (
    <AlarmContext.Provider value={{ activeAlarm, triggerTestAlarm, dismissAlarm, snoozeAlarm }}>
      {children}
      <AlarmRingingModal
        alarm={activeAlarm}
        onDismiss={dismissAlarm}
        onSnooze={snoozeAlarm}
      />
    </AlarmContext.Provider>
  );
};

export const useAlarm = () => {
  const context = useContext(AlarmContext);
  if (!context) throw new Error('useAlarm must be used within an AlarmProvider');
  return context;
};

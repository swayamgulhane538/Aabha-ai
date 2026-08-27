import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VoiceSettingsState {
  language: 'hi' | 'mr' | 'en';
  speechSpeed: 'slow' | 'normal' | 'fast';
  volume: number; // 0.1 to 1.0
  vibration: boolean;
  selectedVoiceURI: string;
  isVoiceAlarmEnabled: boolean;
  speechPitch: number; // 0.8 to 1.2
  setLanguage: (language: 'hi' | 'mr' | 'en') => void;
  setSpeechSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  setVolume: (volume: number) => void;
  setVibration: (vibration: boolean) => void;
  setSelectedVoiceURI: (uri: string) => void;
  setVoiceAlarmEnabled: (enabled: boolean) => void;
  getSpeedRate: () => number;
}

export const useVoiceSettingsStore = create<VoiceSettingsState>()(
  persist(
    (set, get) => ({
      language: 'hi',
      speechSpeed: 'normal',
      volume: 1.0,
      vibration: true,
      selectedVoiceURI: '',
      isVoiceAlarmEnabled: true,
      speechPitch: 1.0,

      setLanguage: (language) => set({ language }),
      setSpeechSpeed: (speechSpeed) => set({ speechSpeed }),
      setVolume: (volume) => set({ volume }),
      setVibration: (vibration) => set({ vibration }),
      setSelectedVoiceURI: (selectedVoiceURI) => set({ selectedVoiceURI }),
      setVoiceAlarmEnabled: (isVoiceAlarmEnabled) => set({ isVoiceAlarmEnabled }),

      getSpeedRate: () => {
        const speed = get().speechSpeed;
        if (speed === 'slow') return 0.82;
        if (speed === 'fast') return 1.18;
        return 0.95;
      }
    }),
    {
      name: 'aabha-voice-settings'
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FontSizeOption = 'normal' | 'large' | 'extra-large';

interface AccessibilityState {
  fontSize: FontSizeOption;
  highContrast: boolean;
  oneHandMode: boolean;
  subtitles: boolean;
  activeSubtitleText: string | null;
  isOpen: boolean;

  setFontSize: (size: FontSizeOption) => void;
  toggleHighContrast: () => void;
  toggleOneHandMode: () => void;
  toggleSubtitles: () => void;
  setSubtitleText: (text: string | null) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      fontSize: 'normal',
      highContrast: false,
      oneHandMode: false,
      subtitles: true,
      activeSubtitleText: null,
      isOpen: false,

      setFontSize: (fontSize) => {
        set({ fontSize });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('text-scale-normal', 'text-scale-large', 'text-scale-xl');
          if (fontSize === 'large') document.documentElement.classList.add('text-scale-large');
          if (fontSize === 'extra-large') document.documentElement.classList.add('text-scale-xl');
        }
      },

      toggleHighContrast: () => {
        const next = !get().highContrast;
        set({ highContrast: next });
        if (typeof document !== 'undefined') {
          if (next) {
            document.documentElement.classList.add('high-contrast-active');
          } else {
            document.documentElement.classList.remove('high-contrast-active');
          }
        }
      },

      toggleOneHandMode: () => {
        const next = !get().oneHandMode;
        set({ oneHandMode: next });
        if (typeof document !== 'undefined') {
          if (next) {
            document.documentElement.classList.add('one-hand-active');
          } else {
            document.documentElement.classList.remove('one-hand-active');
          }
        }
      },

      toggleSubtitles: () => set((state) => ({ subtitles: !state.subtitles })),
      setSubtitleText: (activeSubtitleText) => set({ activeSubtitleText }),
      setIsOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'aabha-accessibility-settings',
    }
  )
);

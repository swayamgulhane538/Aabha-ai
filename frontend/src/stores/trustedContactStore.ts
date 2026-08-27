import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TrustedContact {
  name: string;
  relationship: string;
  phone: string;
  whatsapp: string;
  email: string;
  isConfigured: boolean;
}

interface TrustedContactState {
  contact: TrustedContact;
  updateContact: (contact: Partial<TrustedContact>) => void;
  resetContact: () => void;
}

const DEFAULT_CONTACT: TrustedContact = {
  name: 'Dr. Anita Verma / Priya Sharma',
  relationship: 'Primary Caregiver & Daughter',
  phone: '+919876543210',
  whatsapp: '+919876543210',
  email: 'priya.sharma@aabha.ai',
  isConfigured: true
};

export const useTrustedContactStore = create<TrustedContactState>()(
  persist(
    (set) => ({
      contact: DEFAULT_CONTACT,
      updateContact: (updated) =>
        set((state) => ({
          contact: { ...state.contact, ...updated, isConfigured: true }
        })),
      resetContact: () => set({ contact: DEFAULT_CONTACT })
    }),
    {
      name: 'aabha-trusted-contact'
    }
  )
);

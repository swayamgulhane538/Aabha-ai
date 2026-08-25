import { create } from 'zustand';
import { Reminder } from '../types';
import { api } from '../services/api';

interface ReminderState {
  reminders: Reminder[];
  dueReminders: Reminder[];
  fetchReminders: () => Promise<void>;
  createReminder: (data: Partial<Reminder>) => Promise<void>;
  markComplete: (id: string) => Promise<void>;
  fetchDue: () => Promise<void>;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  dueReminders: [],
  fetchReminders: async () => {
    // const res = await api.get('/reminders');
    set({ reminders: [] });
  },
  createReminder: async (data) => {
    // await api.post('/reminders', data);
    get().fetchReminders();
  },
  markComplete: async (id) => {
    // await api.put(`/reminders/${id}/complete`, {});
    get().fetchReminders();
  },
  fetchDue: async () => {
    // const res = await api.get('/reminders/due');
    set({ dueReminders: [] });
  }
}));

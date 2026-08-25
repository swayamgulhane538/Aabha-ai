import { create } from 'zustand';
import { GameSession } from '../types';
import { api } from '../services/api';

interface GameState {
  currentSession: GameSession | null;
  gameHistory: GameSession[];
  isLoading: boolean;
  startSession: (gameType: string) => void;
  submitResult: (result: Partial<GameSession>) => Promise<void>;
  fetchHistory: () => Promise<void>;
}

export const useGameStore = create<GameState>((set) => ({
  currentSession: null,
  gameHistory: [],
  isLoading: false,
  startSession: (gameType) => {
    set({
      currentSession: {
        id: 'temp',
        patientId: '1',
        gameType,
        difficulty: 1,
        startedAt: new Date().toISOString(),
        isCompleted: false,
      }
    });
  },
  submitResult: async (result) => {
    set({ isLoading: true });
    try {
      await api.post('/api/games/results', result);
    } catch (e) {
      console.error('Error submitting result:', e);
    }
    set({ currentSession: null, isLoading: false });
  },
  fetchHistory: async () => {
    set({ isLoading: true });
    try {
      const history = await api.get('/api/games/history/me');
      set({ gameHistory: Array.isArray(history) ? history : [], isLoading: false });
    } catch {
      set({ gameHistory: [], isLoading: false });
    }
  }
}));

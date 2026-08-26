import { useState, useEffect } from 'react';
import { api } from './api';

export interface SyncItem {
  id: string;
  action: 'GAME_RESULT' | 'ROUTINE_CHECK' | 'HYDRATION_LOG' | 'MED_TAKEN';
  payload: any;
  timestamp: string;
}

const STORAGE_KEY_QUEUE = 'aabha_offline_sync_queue';

export class OfflineSyncManager {
  static getQueue(): SyncItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_QUEUE);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static addToQueue(action: SyncItem['action'], payload: any): void {
    try {
      const queue = this.getQueue();
      // Deduplicate identical pending actions
      const exists = queue.some(
        q => q.action === action && JSON.stringify(q.payload) === JSON.stringify(payload)
      );
      if (!exists) {
        queue.push({
          id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          action,
          payload,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
      }
    } catch {}
  }

  static async processQueue(): Promise<number> {
    const queue = this.getQueue();
    if (queue.length === 0) return 0;

    let syncedCount = 0;
    const remaining: SyncItem[] = [];

    for (const item of queue) {
      try {
        if (item.action === 'GAME_RESULT') {
          await api.post('/games/result', item.payload).catch(() => {});
        } else if (item.action === 'HYDRATION_LOG') {
          await api.post('/vitals/hydration', item.payload).catch(() => {});
        } else if (item.action === 'MED_TAKEN') {
          await api.post('/medications/log', item.payload).catch(() => {});
        }
        syncedCount++;
      } catch {
        remaining.push(item);
      }
    }

    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(remaining));
    return syncedCount;
  }
}

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      OfflineSyncManager.processQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

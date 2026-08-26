import React, { useState, useEffect } from 'react';
import { useOnlineStatus, OfflineSyncManager } from '../services/offlineService';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    const checkQueue = () => {
      setQueueLength(OfflineSyncManager.getQueue().length);
    };
    checkQueue();
    const interval = setInterval(checkQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    await OfflineSyncManager.processQueue();
    setQueueLength(OfflineSyncManager.getQueue().length);
    setIsSyncing(false);
  };

  if (!isOnline) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-black shadow-sm animate-pulse"
        title="Offline Mode — All games and routines are saved locally and will auto-sync when online"
      >
        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
        <WifiOff className="w-3.5 h-3.5" />
        <span>🔴 Offline (Local Vault)</span>
      </div>
    );
  }

  if (isSyncing || queueLength > 0) {
    return (
      <button
        onClick={handleManualSync}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black shadow-sm cursor-pointer"
        title="Click to sync pending offline actions"
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
        <span>🟠 Syncing ({queueLength})</span>
      </button>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-black shadow-2xs"
      title="Connected & All Data Synchronized"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      <span>🟢 Synced</span>
    </div>
  );
};

export default OfflineIndicator;

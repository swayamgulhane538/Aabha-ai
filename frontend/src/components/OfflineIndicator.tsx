import React, { useEffect, useState, useRef } from 'react';
import { WifiOff, CheckCircle2, RefreshCw, X } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'offline' | 'online' | 'synced'>('offline');

  // Track if we actually experienced an offline transition during this session
  const wasOfflineRef = useRef<boolean>(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);

      // Only show "Back online" if the user was actually offline during this session!
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        setToastType('online');
        setToastMessage('✓ Back online — all features restored');

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setToastMessage(null);
        }, 3500);
      }
    };

    const handleOffline = () => {
      wasOfflineRef.current = true;
      setIsOnline(false);
      setToastType('offline');
      setToastMessage("⚠️ You're offline — cached records available");

      if (timerRef.current) clearTimeout(timerRef.current);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // When online and no transition toast active, render nothing
  if (isOnline && !toastMessage) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[999] max-w-sm pointer-events-auto animate-fade-in"
    >
      <div
        className={`px-4 py-2.5 rounded-2xl border-2 shadow-lg flex items-center gap-3 text-xs font-black transition-all ${
          !isOnline
            ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-amber-200/50'
            : toastType === 'online'
            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-emerald-200/50'
            : 'bg-black border-black text-white'
        }`}
      >
        {!isOnline ? (
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        )}

        <span className="leading-tight">
          {!isOnline ? "⚠️ You're offline" : toastMessage}
        </span>

        {isOnline && (
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-md hover:bg-black/10 transition ml-1"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5 text-current" />
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;

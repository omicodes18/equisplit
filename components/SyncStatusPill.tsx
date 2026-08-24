'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Sparkles, CheckCircle2 } from 'lucide-react';

export function SyncStatusPill() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 backdrop-blur-md border shadow-sm select-none ${
        isOnline
          ? 'bg-primary/10 border-primary/25 text-primary shadow-[0_0_10px_rgba(244,114,182,0.15)]'
          : 'bg-[#0f2a1d] border-amber-500/30 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.15)]'
      }`}
      title={
        isOnline
          ? 'Connected & synced locally with IndexedDB'
          : 'Offline mode active — all changes persist securely in local IndexedDB'
      }
    >
      {isOnline ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="tracking-wide flex items-center gap-1">
            <span>✨</span>
            <span>Synced</span>
          </span>
        </>
      ) : (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <span className="tracking-wide flex items-center gap-1">
            <span>🌿</span>
            <span>Offline Mode - Changes saved locally</span>
          </span>
        </>
      )}
    </div>
  );
}

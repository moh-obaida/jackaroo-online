import React from 'react';
import { useApp } from '../../context/AppContext';
import { useGame } from '../../context/GameContext';
import { useLocation } from 'react-router-dom';

/**
 * Live connection indicator (Knowledge Connect session discipline).
 * Firebase + room session only — not game rules. See docs/ARCHITECTURE_REFERENCES.md.
 */
export function ConnectionBar() {
  const { t, firebaseReady, authLoading } = useApp();
  const { roomCode, isLeaving, roomLoaded, room } = useGame();
  const location = useLocation();

  const onRoomRoute = /^\/(lobby|game)\//.test(location.pathname);

  let status: 'offline' | 'connecting' | 'live' | 'leaving' = 'offline';
  if (!firebaseReady) status = 'offline';
  else if (isLeaving) status = 'leaving';
  else if (onRoomRoute && roomCode && !roomLoaded) status = 'connecting';
  else if (onRoomRoute && roomCode && room) status = 'live';
  else if (firebaseReady) status = 'live';

  const label =
    status === 'offline'
      ? t('connection.offline')
      : status === 'connecting'
        ? t('connection.syncing')
        : status === 'leaving'
          ? t('connection.leaving')
          : t('connection.live');

  const dot =
    status === 'live'
      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
      : status === 'connecting'
        ? 'bg-amber-400 animate-pulse'
        : status === 'leaving'
          ? 'bg-red-400 animate-pulse'
          : 'bg-neutral-500';

  return (
    <div
      className="connection-bar flex items-center gap-2 text-[10px] uppercase tracking-wider text-cream-200/50"
      role="status"
      aria-live="polite"
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} aria-hidden />
      <span>{label}</span>
      {roomCode && onRoomRoute && status === 'live' && (
        <span className="tabular-nums text-cream-200/35 hidden sm:inline">· {roomCode}</span>
      )}
    </div>
  );
}

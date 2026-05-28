import React from 'react';
import { useApp } from '../../context/AppContext';
import { useGame } from '../../context/GameContext';
import { useLocation } from 'react-router-dom';

/**
 * Room-session sync indicator — only on lobby/game routes (not marketing home).
 */
export function ConnectionBar() {
  const { t, firebaseReady } = useApp();
  const { roomCode, isLeaving, roomLoaded, room } = useGame();
  const location = useLocation();

  const onRoomRoute = /^\/(lobby|game)\//.test(location.pathname);
  if (!onRoomRoute) return null;

  let status: 'offline' | 'connecting' | 'live' | 'leaving' = 'offline';
  if (!firebaseReady) status = 'offline';
  else if (isLeaving) status = 'leaving';
  else if (roomCode && !roomLoaded) status = 'connecting';
  else if (roomCode && room) status = 'live';
  else if (firebaseReady) status = 'live';

  const label =
    status === 'offline'
      ? t('connection.offline')
      : status === 'connecting'
        ? t('connection.syncing')
        : status === 'leaving'
          ? t('connection.leaving')
          : t('connection.roomLive');

  const dot =
    status === 'live'
      ? 'connection-bar__dot--live'
      : status === 'connecting'
        ? 'connection-bar__dot--sync'
        : status === 'leaving'
          ? 'connection-bar__dot--leave'
          : 'connection-bar__dot--off';

  return (
    <div className="connection-bar" role="status" aria-live="polite">
      <span className={`connection-bar__dot ${dot}`} aria-hidden />
      <span className="connection-bar__label">{label}</span>
      {roomCode && status === 'live' && (
        <span className="connection-bar__code tabular-nums">{roomCode}</span>
      )}
    </div>
  );
}

import React from 'react';
import { useApp } from '../../context/AppContext';
import { useGame } from '../../context/GameContext';
import { useLocation } from 'react-router-dom';

type ConnectionBarProps = {
  /** Game HUD uses always-visible compact strip */
  variant?: 'header' | 'game';
};

/**
 * Room-session sync indicator — Connected / Syncing / Reconnecting on lobby & game routes.
 */
export function ConnectionBar({ variant = 'header' }: ConnectionBarProps) {
  const { t, firebaseReady } = useApp();
  const { roomCode, isLeaving, roomLoaded, room } = useGame();
  const location = useLocation();

  const onRoomRoute = /^\/(lobby|game)\//.test(location.pathname);
  if (!onRoomRoute) return null;

  let status: 'offline' | 'connecting' | 'live' | 'leaving' = 'offline';
  if (!firebaseReady) status = 'offline';
  else if (isLeaving) status = 'leaving';
  else if (roomCode && !roomLoaded) status = 'connecting';
  else if (roomCode && roomLoaded && room) status = 'live';

  const label =
    status === 'offline'
      ? t('connection.offline')
      : status === 'connecting'
        ? t('connection.syncing')
        : status === 'leaving'
          ? t('connection.leaving')
          : t('connection.connected');

  const dot =
    status === 'live'
      ? 'connection-bar__dot--live'
      : status === 'connecting'
        ? 'connection-bar__dot--sync'
        : status === 'leaving'
          ? 'connection-bar__dot--leave'
          : 'connection-bar__dot--off';

  return (
    <div
      className={`connection-bar ${variant === 'game' ? 'connection-bar--game' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className={`connection-bar__dot ${dot}`} aria-hidden />
      <span className="connection-bar__label">{label}</span>
      {variant === 'header' && roomCode && status === 'live' && (
        <span className="connection-bar__code tabular-nums">{roomCode}</span>
      )}
    </div>
  );
}

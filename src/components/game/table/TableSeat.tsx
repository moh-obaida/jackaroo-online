import React from 'react';
import { GameState, PlayerState } from '../../../types/game';
import { CardBack } from '../../cards/PlayingCard';
import { useApp } from '../../../context/AppContext';
import { VoiceStatusBadge } from '../../voice/VoiceStatusBadge';
import { VoiceParticipantStatus } from '../../../lib/voice/types';

const colorStyles: Record<string, { rim: string; glow: string; badge: string }> = {
  black: { rim: 'border-gray-500/80', glow: 'shadow-[0_0_12px_rgba(120,120,120,0.5)]', badge: 'bg-gray-700' },
  green: { rim: 'border-green-500/80', glow: 'shadow-[0_0_14px_rgba(52,211,153,0.45)]', badge: 'bg-green-800' },
  blue: { rim: 'border-blue-400/80', glow: 'shadow-[0_0_14px_rgba(96,165,250,0.45)]', badge: 'bg-blue-800' },
  white: { rim: 'border-amber-200/80', glow: 'shadow-[0_0_14px_rgba(254,243,199,0.35)]', badge: 'bg-amber-100 text-gray-900' },
};

type TableSeatProps = {
  player: PlayerState;
  gameState: GameState;
  compact?: boolean;
  voiceStatus?: VoiceParticipantStatus;
  isYou?: boolean;
  opponentLabel?: boolean;
};

/** Ludo-style corner seat + Uno-style stacked card backs. */
export function TableSeat({
  player,
  gameState,
  compact = false,
  voiceStatus,
  isYou = false,
  opponentLabel = false,
}: TableSeatProps) {
  const { t } = useApp();
  const isTurn = gameState.currentTurnPlayerId === player.id;
  const count = gameState.handCounts[player.id] ?? 0;
  const style = colorStyles[player.color] || colorStyles.black;
  const showTeam = gameState.mode === '4p_teams' && player.team;

  return (
    <div
      className={`table-seat ${isTurn ? 'table-seat--turn' : ''} ${compact ? 'table-seat--compact' : ''}`}
      aria-label={player.name}
    >
      <div className={`table-seat__rim ${style.rim} ${isTurn ? style.glow : ''}`}>
        <span
          className={`table-seat__color-dot table-seat__color-dot--${player.color}`}
          aria-hidden
        />
        <div className="table-seat__info">
          <p className="table-seat__name">
            {isYou ? t('game.you') : player.name}
            {opponentLabel && !isYou && (
              <span className="table-seat__role"> · {t('game.opponent')}</span>
            )}
          </p>
          <p className="table-seat__meta">
            <span className="table-seat__color-label">{t(`game.color.${player.color}`)}</span>
            {' · '}
            {t('game.cardsCount', { count: String(count) })}
            {player.isBot && ` · ${t('lobby.addBot')}`}
          </p>
        </div>
        {isYou && <span className="table-seat__you-badge">{t('game.you')}</span>}
        {showTeam && (
          <span className="table-seat__team">{player.team}</span>
        )}
        {isTurn && <span className="table-seat__turn-badge">{t('game.turnNow')}</span>}
        {voiceStatus && voiceStatus !== 'not_joined' && (
          <VoiceStatusBadge status={voiceStatus} className="table-seat__voice-badge" />
        )}
      </div>
      <div className="table-seat__cards" aria-hidden>
        {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
          <CardBack
            key={i}
            compact
            className="table-seat__card-back"
            style={{ marginLeft: i === 0 ? 0 : -10, zIndex: i }}
          />
        ))}
        {count > 5 && <span className="table-seat__more">+{count - 5}</span>}
      </div>
    </div>
  );
}

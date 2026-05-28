import React from 'react';
import { GameState, PlayerState } from '../../types/game';
import { CardBack } from '../cards/PlayingCard';
import { useApp } from '../../context/AppContext';

const colorRing: Record<string, string> = {
  black: 'ring-gray-500',
  green: 'ring-green-500',
  blue: 'ring-blue-400',
  white: 'ring-amber-200',
};

function opponentForSlot(
  players: PlayerState[],
  mySeat: number,
  slot: 'top' | 'left' | 'right'
): PlayerState | null {
  const n = players.length;
  if (n < 2) return null;

  let offset: number | null = null;
  if (slot === 'top') offset = n === 2 ? 1 : 2;
  else if (slot === 'right') offset = n >= 3 ? 1 : null;
  else if (slot === 'left') offset = n >= 4 ? 3 : null;

  if (offset === null) return null;
  const seat = (mySeat + offset) % n;
  return players.find((p) => p.seat === seat) ?? null;
}

interface OpponentStripProps {
  gameState: GameState;
  myPlayerId: string;
  slot: 'top' | 'left' | 'right';
}

export function OpponentStrip({ gameState, myPlayerId, slot }: OpponentStripProps) {
  const { t } = useApp();
  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  if (!myPlayer) return null;

  const opponent = opponentForSlot(gameState.players, myPlayer.seat, slot);
  if (!opponent || opponent.id === myPlayerId) return null;

  const layoutClass =
    slot === 'top'
      ? 'flex flex-wrap justify-center gap-2 sm:gap-3'
      : 'flex flex-col gap-2 items-center justify-center';

  const isTurn = gameState.currentTurnPlayerId === opponent.id;
  const count = gameState.handCounts[opponent.id] ?? 0;
  const ring = colorRing[opponent.color] || 'ring-wood-600';

  return (
    <div className={layoutClass} aria-label={t('game.opponents')}>
      <div
        className={`opponent-chip flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-wood-700/60 bg-black/45 backdrop-blur-sm ${
          isTurn ? 'turn-pulse border-gold-500/50' : ''
        }`}
      >
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ring-2 ${ring}`} aria-hidden />
        <div className="min-w-0 text-start">
          <p
            className={`text-xs font-semibold truncate max-w-[7rem] sm:max-w-[9rem] ${
              isTurn ? 'text-gold-300' : 'text-cream-100/90'
            }`}
          >
            {opponent.name}
          </p>
          <p className="text-[10px] text-cream-200/45 tabular-nums">
            {t('game.cardsCount', { count: String(count) })}
          </p>
        </div>
        <div className="flex gap-0.5 shrink-0" aria-hidden>
          {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
            <CardBack key={i} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { GameState, PlayerState } from '../../types/game';
import { TableSeat } from './table/TableSeat';

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

type OpponentStripProps = {
  gameState: GameState;
  myPlayerId: string;
  slot: 'top' | 'left' | 'right';
};

export function OpponentStrip({ gameState, myPlayerId, slot }: OpponentStripProps) {
  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  if (!myPlayer) return null;

  const opponent = opponentForSlot(gameState.players, myPlayer.seat, slot);
  if (!opponent || opponent.id === myPlayerId) return null;

  return <TableSeat player={opponent} gameState={gameState} compact={slot !== 'top'} />;
}

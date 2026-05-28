import React from 'react';
import { BoardPosition, GameState } from '../../types/game';
import { BoardVisualFromGame } from './boardVisual';

interface GameBoardProps {
  gameState: GameState;
  selectedCardId: string | null;
  highlightPositions?: BoardPosition[];
  playerId: string;
  isMyTurn?: boolean;
  onPositionClick?: (pos: BoardPosition) => void;
}

export function GameBoard({
  gameState,
  selectedCardId: _selectedCardId,
  highlightPositions = [],
  playerId,
  isMyTurn = false,
  onPositionClick,
}: GameBoardProps) {
  return (
    <BoardVisualFromGame
      gameState={gameState}
      playerId={playerId}
      highlightPositions={highlightPositions}
      isMyTurn={isMyTurn}
      onPositionClick={onPositionClick}
      className="max-w-[min(100vw-1.5rem,44rem)] drop-shadow-board"
    />
  );
}

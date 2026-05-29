import React from 'react';
import { BoardPosition, GameState } from '../../types/game';
import { BoardVisualFromGame } from './boardVisual';

interface GameBoardProps {
  gameState: GameState;
  selectedCardId: string | null;
  highlightPositions?: BoardPosition[];
  playerId: string;
  isMyTurn?: boolean;
  selectableMarbleIds?: Set<string>;
  selectedMarbleId?: string | null;
  onMarbleClick?: (marbleId: string) => void;
  onPositionClick?: (pos: BoardPosition) => void;
}

export function GameBoard({
  gameState,
  selectedCardId: _selectedCardId,
  highlightPositions = [],
  playerId,
  isMyTurn = false,
  selectableMarbleIds,
  selectedMarbleId,
  onMarbleClick,
  onPositionClick,
}: GameBoardProps) {
  return (
    <BoardVisualFromGame
      gameState={gameState}
      playerId={playerId}
      highlightPositions={highlightPositions}
      selectableMarbleIds={selectableMarbleIds}
      selectedMarbleId={selectedMarbleId}
      onMarbleClick={onMarbleClick}
      isMyTurn={isMyTurn}
      onPositionClick={onPositionClick}
      className="max-w-[min(100vw-1.5rem,44rem)] drop-shadow-board"
    />
  );
}

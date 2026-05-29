import React from 'react';
import { GameState, BoardPosition } from '../../../types/game';
import { GameBoard } from '../../board/GameBoard';
import { OpponentSeats } from './OpponentSeats';
import { VoiceParticipantStatus } from '../../../lib/voice/types';

type TablePlayAreaProps = {
  gameState: GameState;
  playerId: string;
  selectedCardId: string | null;
  highlightPositions: BoardPosition[];
  selectableMarbleIds?: Set<string>;
  selectedMarbleId?: string | null;
  onMarbleClick?: (marbleId: string) => void;
  onPositionClick?: (pos: BoardPosition) => void;
  isMyTurn: boolean;
  getVoiceStatus?: (playerId: string) => VoiceParticipantStatus;
};

/** Board zone — centered felt surface with seats on the rim (no floating deck UI). */
export function TablePlayArea({
  gameState,
  playerId,
  selectedCardId,
  highlightPositions,
  selectableMarbleIds,
  selectedMarbleId,
  onMarbleClick,
  onPositionClick,
  isMyTurn,
  getVoiceStatus,
}: TablePlayAreaProps) {
  const boardRimClass =
    import.meta.env.VITE_BOARD_PROCEDURAL === '1'
      ? 'board-wood-rim board-wood-rim--hero'
      : import.meta.env.VITE_BOARD_PHYSICAL === '1'
        ? 'board-wood-rim board-wood-rim--photo'
        : 'board-wood-rim board-wood-rim--image';

  return (
    <div className="table-play-area">
      <div className="table-play-area__felt" aria-hidden />
      <div className="table-play-area__seats pointer-events-none">
        <OpponentSeats
          gameState={gameState}
          myPlayerId={playerId}
          getVoiceStatus={getVoiceStatus}
        />
      </div>
      <div className="table-play-area__board">
        <div className={boardRimClass}>
          <GameBoard
            gameState={gameState}
            selectedCardId={selectedCardId}
            highlightPositions={highlightPositions}
            selectableMarbleIds={selectableMarbleIds}
            selectedMarbleId={selectedMarbleId}
            onMarbleClick={onMarbleClick}
            onPositionClick={onPositionClick}
            playerId={playerId}
            isMyTurn={isMyTurn}
          />
        </div>
      </div>
    </div>
  );
}

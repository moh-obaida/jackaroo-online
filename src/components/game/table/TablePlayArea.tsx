import React from 'react';
import { GameState, BoardPosition } from '../../../types/game';
import { GameBoard } from '../../board/GameBoard';
import { OpponentSeats } from './OpponentSeats';

type TablePlayAreaProps = {
  gameState: GameState;
  playerId: string;
  selectedCardId: string | null;
  highlightPositions: BoardPosition[];
  isMyTurn: boolean;
};

/** Single felt surface — Ludo board in the middle, seats on the rim. */
export function TablePlayArea({
  gameState,
  playerId,
  selectedCardId,
  highlightPositions,
  isMyTurn,
}: TablePlayAreaProps) {
  return (
    <div className="table-play-area">
      <div className="table-play-area__felt" aria-hidden />
      <div className="table-play-area__seats pointer-events-none">
        <OpponentSeats gameState={gameState} myPlayerId={playerId} />
      </div>
      <div className="table-play-area__board">
        <div className="board-wood-rim board-wood-rim--hero">
          <GameBoard
            gameState={gameState}
            selectedCardId={selectedCardId}
            highlightPositions={highlightPositions}
            playerId={playerId}
            isMyTurn={isMyTurn}
          />
        </div>
      </div>
    </div>
  );
}

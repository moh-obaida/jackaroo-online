import React, { useMemo, useState } from 'react';
import { GameState, GameAction, LegalAction, Card } from '../../../types/game';
import { GameBoard } from '../../board/GameBoard';
import { CardGuideModal } from '../../cards/CardGuideModal';
import { WinOverlay } from '../WinOverlay';
import { GameHUD } from './GameHUD';
import { OpponentSeats } from './OpponentSeats';
import { HandDock } from './HandDock';
import { ActionRail } from './ActionRail';
import { DeckDiscardPiles } from './DeckDiscardPiles';
import { ActivityStrip } from './ActivityStrip';

export type FullScreenGameTableProps = {
  roomCode: string;
  gameState: GameState;
  playerId: string;
  myHand: Card[];
  legalActions: LegalAction[];
  isMyTurn: boolean;
  onSubmitAction: (action: GameAction) => Promise<void>;
  onLeave: () => void;
  leaveBusy: boolean;
  gameError: string | null;
  leaveWarning: string | null;
};

export function FullScreenGameTable({
  roomCode,
  gameState,
  playerId,
  myHand,
  legalActions,
  isMyTurn,
  onSubmitAction,
  onLeave,
  leaveBusy,
  gameError,
  leaveWarning,
}: FullScreenGameTableProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [deckGuideOpen, setDeckGuideOpen] = useState(false);

  const currentPlayer = useMemo(
    () => gameState.players.find((p) => p.id === playerId) ?? null,
    [gameState.players, playerId]
  );

  const turnPlayer = useMemo(
    () => gameState.players.find((p) => p.id === gameState.currentTurnPlayerId) ?? null,
    [gameState, gameState.currentTurnPlayerId]
  );

  return (
    <div className="fullscreen-game-table flex flex-col h-[100dvh] max-h-[100dvh] w-full overflow-hidden">
      {gameState.winner && <WinOverlay gameState={gameState} />}

      <GameHUD
        roomCode={roomCode}
        gameState={gameState}
        isMyTurn={isMyTurn}
        turnPlayerName={turnPlayer?.name || ''}
        onLeave={onLeave}
        leaveBusy={leaveBusy}
      />

      {(gameError || leaveWarning) && (
        <p className="text-xs text-amber-200/90 bg-amber-950/40 px-3 py-1 text-center shrink-0">
          {gameError || leaveWarning}
        </p>
      )}

      <div className="flex-1 flex flex-col min-h-0 relative">
        <div className="absolute inset-0 pointer-events-none opponent-seats-layer px-1 pt-1 pb-[42%] sm:pb-[38%]">
          <OpponentSeats gameState={gameState} myPlayerId={playerId} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-2 pt-8 pb-[46%] sm:pb-[42%]">
          <div className="board-hero-stage board-stage w-full max-w-[min(100%,42rem)] flex items-center justify-center">
            <div className="board-wood-rim w-full">
              <GameBoard
                gameState={gameState}
                selectedCardId={selectedCardId}
                playerId={playerId}
                isMyTurn={isMyTurn}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 z-10 flex flex-col bg-gradient-to-t from-[#060504] via-[#080604]/98 to-transparent px-2 sm:px-3 pt-2 border-t border-wood-900/80">
          <div className="flex gap-3 items-end mb-1">
            <DeckDiscardPiles gameState={gameState} onShowDeckGuide={() => setDeckGuideOpen(true)} />
            <ActivityStrip gameState={gameState} />
          </div>
          <HandDock
            playerName={currentPlayer?.name || ''}
            cards={myHand}
            selectedCardId={selectedCardId}
            onSelectCard={setSelectedCardId}
            disabled={!isMyTurn}
          >
            <ActionRail
              legalActions={legalActions}
              selectedCardId={selectedCardId}
              onSubmitAction={onSubmitAction}
              playerId={playerId}
              isMyTurn={isMyTurn}
            />
          </HandDock>
        </div>
      </div>

      <CardGuideModal open={deckGuideOpen} onClose={() => setDeckGuideOpen(false)} />
    </div>
  );
}

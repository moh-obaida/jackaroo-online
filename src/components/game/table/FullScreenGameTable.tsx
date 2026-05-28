import React, { useMemo, useState } from 'react';
import { GameState, GameAction, LegalAction, Card } from '../../../types/game';
import { usePlayTurn } from '../../../hooks/usePlayTurn';
import { getHighlightPositionsForCard } from '../../../lib/play/boardHighlights';
import { getPlayableCardIds } from '../../../lib/play/presentActions';
import { CardGuideModal } from '../../cards/CardGuideModal';
import { WinOverlay } from '../WinOverlay';
import { PlayActionSheet } from '../play/PlayActionSheet';
import { GameHUD } from './GameHUD';
import { TurnCue } from './TurnCue';
import { TablePlayArea } from './TablePlayArea';
import { HandDock } from './HandDock';
import { DeckDiscardPiles } from './DeckDiscardPiles';
import { TableActivity } from './TableActivity';
import { Alert } from '../../ui/Alert';

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
  const [deckGuideOpen, setDeckGuideOpen] = useState(false);

  const turnKey = `${gameState.currentTurnPlayerId}:${gameState.dealState.dealRoundInBlock}:${legalActions.length}`;
  const { selectedCardId, setSelectedCardId, showAllActions, setShowAllActions } = usePlayTurn(
    isMyTurn,
    turnKey,
    myHand,
    legalActions
  );

  const playableCardIds = useMemo(
    () => (isMyTurn ? getPlayableCardIds(legalActions) : []),
    [isMyTurn, legalActions]
  );

  const highlightPositions = useMemo(
    () => getHighlightPositionsForCard(legalActions, selectedCardId),
    [legalActions, selectedCardId]
  );

  const currentPlayer = useMemo(
    () => gameState.players.find((p) => p.id === playerId) ?? null,
    [gameState.players, playerId]
  );

  const turnPlayer = useMemo(
    () => gameState.players.find((p) => p.id === gameState.currentTurnPlayerId) ?? null,
    [gameState, gameState.currentTurnPlayerId]
  );

  return (
    <div className="fullscreen-game-table jkr-stack flex flex-col h-[100dvh] max-h-[100dvh] w-full overflow-hidden max-w-[100vw]">
      {gameState.winner && <WinOverlay gameState={gameState} />}

      <GameHUD roomCode={roomCode} gameState={gameState} onLeave={onLeave} leaveBusy={leaveBusy} />

      <TurnCue isMyTurn={isMyTurn} turnPlayerName={turnPlayer?.name || ''} />

      {(gameError || leaveWarning) && (
        <Alert variant="warn" className="rounded-none border-x-0 shrink-0 text-xs py-1.5">
          {gameError || leaveWarning}
        </Alert>
      )}

      <div className="table-play-area-wrap flex-1 min-h-0 flex flex-col overflow-hidden">
        <TablePlayArea
          gameState={gameState}
          playerId={playerId}
          selectedCardId={selectedCardId}
          highlightPositions={highlightPositions}
          isMyTurn={isMyTurn}
        />
      </div>

      <div className="game-hand-rail">
        <div className="game-hand-rail__top">
          <DeckDiscardPiles gameState={gameState} onShowDeckGuide={() => setDeckGuideOpen(true)} />
          <TableActivity gameState={gameState} />
        </div>
        <HandDock
          playerName={currentPlayer?.name || ''}
          cards={myHand}
          selectedCardId={selectedCardId}
          playableCardIds={playableCardIds}
          onSelectCard={setSelectedCardId}
          disabled={!isMyTurn}
          legalActions={legalActions}
          hand={myHand}
          showAllActions={showAllActions}
          onToggleShowAll={setShowAllActions}
          onSubmitAction={onSubmitAction}
          playerId={playerId}
          isMyTurn={isMyTurn}
        />
      </div>

      <CardGuideModal open={deckGuideOpen} onClose={() => setDeckGuideOpen(false)} />
    </div>
  );
}

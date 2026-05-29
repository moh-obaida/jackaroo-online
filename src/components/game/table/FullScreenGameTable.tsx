import React, { useEffect, useMemo, useState } from 'react';
import { GameState, GameAction, LegalAction, Card } from '../../../types/game';
import { usePlayTurn } from '../../../hooks/usePlayTurn';
import { useBoardPlaySelection } from '../../../hooks/useBoardPlaySelection';
import { useVoiceChat } from '../../../hooks/useVoiceChat';
import { getPlayableCardIds } from '../../../lib/play/presentActions';
import { explainNoLegalMove } from '../../../lib/game/explainNoLegalMove';
import { isLegalMoveAuditEnabled, logLegalMoveAudit } from '../../../lib/game/legalMoveAudit';
import { CardGuideModal } from '../../cards/CardGuideModal';
import { WinOverlay } from '../WinOverlay';
import { PlayActionSheet } from '../play/PlayActionSheet';
import { GameHUD } from './GameHUD';
import { TablePlayArea } from './TablePlayArea';
import { HandDock } from './HandDock';
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
  const voice = useVoiceChat(roomCode, playerId);

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

  const currentPlayer = useMemo(
    () => gameState.players.find((p) => p.id === playerId) ?? null,
    [gameState.players, playerId]
  );

  const boardPlay = useBoardPlaySelection({
    legalActions,
    selectedCardId,
    marbles: gameState.marbles,
    playerColor: currentPlayer?.color ?? null,
    playerId,
    isMyTurn,
    onSubmitAction,
  });

  const noLegalReasonKey = useMemo(() => {
    if (!isMyTurn) return null;
    const burnAll = legalActions.find((a) => a.type === 'burn_all_cards');
    if (!burnAll) return null;
    return explainNoLegalMove(gameState, myHand);
  }, [isMyTurn, legalActions, gameState, myHand]);

  useEffect(() => {
    if (!isLegalMoveAuditEnabled() || !isMyTurn) return;
    logLegalMoveAudit(gameState, myHand, selectedCardId, roomCode);
  }, [gameState, myHand, selectedCardId, isMyTurn, roomCode]);

  const turnPlayer = useMemo(
    () => gameState.players.find((p) => p.id === gameState.currentTurnPlayerId) ?? null,
    [gameState, gameState.currentTurnPlayerId]
  );

  const boardFlowHintKey = boardPlay.playFlowHintKey;

  return (
    <div className="fullscreen-game-table jkr-stack flex flex-col h-[100dvh] max-h-[100dvh] w-full overflow-hidden max-w-[100vw]">
      {gameState.winner && <WinOverlay gameState={gameState} />}

      <GameHUD
        roomCode={roomCode}
        gameState={gameState}
        isMyTurn={isMyTurn}
        turnPlayerName={turnPlayer?.name || ''}
        onLeave={onLeave}
        leaveBusy={leaveBusy}
        myColor={currentPlayer?.color ?? null}
      />

      {(gameError || leaveWarning) && (
        <Alert variant="warn" className="rounded-none border-x-0 shrink-0 text-xs py-1.5">
          {gameError || leaveWarning}
        </Alert>
      )}

      <div className="table-play-area-wrap flex-1 min-h-0 flex flex-col">
        <TablePlayArea
          gameState={gameState}
          playerId={playerId}
          selectedCardId={selectedCardId}
          highlightPositions={boardPlay.boardHighlightPositions}
          selectableMarbleIds={boardPlay.marbleHighlightIds}
          selectedMarbleId={boardPlay.selectedMarbleId}
          onMarbleClick={boardPlay.handleMarbleClick}
          onPositionClick={boardPlay.handlePositionClick}
          isMyTurn={isMyTurn}
          onShowDeckGuide={() => setDeckGuideOpen(true)}
          getVoiceStatus={voice.getParticipantStatus}
        />
      </div>

      <div className="game-hand-rail">
        <div className="game-hand-rail__top">
          <TableActivity gameState={gameState} />
        </div>
        <HandDock
          playerName={currentPlayer?.name || ''}
          playerColor={currentPlayer?.color ?? null}
          hand={myHand}
          selectedCardId={selectedCardId}
          playableCardIds={playableCardIds}
          onSelectCard={setSelectedCardId}
          disabled={!isMyTurn}
          legalActions={legalActions}
          showAllActions={showAllActions}
          onToggleShowAll={setShowAllActions}
          onSubmitAction={onSubmitAction}
          playerId={playerId}
          isMyTurn={isMyTurn}
          noLegalReasonKey={noLegalReasonKey}
          boardFlowHintKey={boardFlowHintKey}
        />
      </div>

      <CardGuideModal open={deckGuideOpen} onClose={() => setDeckGuideOpen(false)} />
    </div>
  );
}

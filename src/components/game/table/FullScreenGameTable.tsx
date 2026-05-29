import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { GameState, GameAction, LegalAction, Card } from '../../../types/game';
import { useApp } from '../../../context/AppContext';
import { translateSessionMessage } from '../../../lib/i18n/translateSessionMessage';
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
  legalMovesReady: boolean;
  isMyTurn: boolean;
  isSubmittingAction?: boolean;
  onSubmitAction: (
    action: GameAction
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
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
  legalMovesReady,
  isMyTurn,
  isSubmittingAction = false,
  onSubmitAction,
  onLeave,
  leaveBusy,
  gameError,
  leaveWarning,
}: FullScreenGameTableProps) {
  const { t } = useApp();
  const [deckGuideOpen, setDeckGuideOpen] = useState(false);
  const voice = useVoiceChat(roomCode, playerId);

  const turnKey = `${gameState.turnNumber}:${gameState.currentTurnPlayerId}:${gameState.dealState.dealBlock}:${gameState.dealState.dealRoundInBlock}`;
  const { selectedCardId, setSelectedCardId, showAllActions, setShowAllActions } = usePlayTurn(
    isMyTurn,
    turnKey,
    myHand,
    legalActions
  );

  const clearPlaySelection = useCallback(() => {
    setSelectedCardId(null);
    setShowAllActions(false);
  }, [setSelectedCardId, setShowAllActions]);

  const handleSubmitAction = useCallback(
    async (action: GameAction) => {
      const result = await onSubmitAction(action);
      clearPlaySelection();
      return result;
    },
    [onSubmitAction, clearPlaySelection]
  );

  const playableCardIds = useMemo(
    () => (isMyTurn && legalMovesReady ? getPlayableCardIds(legalActions) : []),
    [isMyTurn, legalMovesReady, legalActions]
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
    turnKey,
    isSubmittingAction,
    onSubmitAction: handleSubmitAction,
  });

  const noLegalReasonKey = useMemo(() => {
    if (!isMyTurn || !legalMovesReady) return null;
    const burnAll = legalActions.find((a) => a.type === 'burn_all_cards');
    if (!burnAll) return null;
    return explainNoLegalMove(gameState, myHand);
  }, [isMyTurn, legalMovesReady, legalActions, gameState, myHand]);

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
        onShowDeckGuide={() => setDeckGuideOpen(true)}
      />

      {(gameError || leaveWarning) && (
        <Alert variant="warn" className="rounded-none border-x-0 shrink-0 text-xs py-1.5">
          {translateSessionMessage(t, gameError || leaveWarning || '')}
        </Alert>
      )}

      <div className="game-play-layout">
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
            disabled={!isMyTurn || isSubmittingAction}
            legalActions={legalActions}
            showAllActions={showAllActions}
            onToggleShowAll={setShowAllActions}
            onSubmitAction={handleSubmitAction}
            playerId={playerId}
            isMyTurn={isMyTurn}
            legalMovesReady={legalMovesReady}
            isSubmittingAction={isSubmittingAction}
            noLegalReasonKey={noLegalReasonKey}
            boardFlowHintKey={boardFlowHintKey}
          />
        </div>
      </div>

      <CardGuideModal open={deckGuideOpen} onClose={() => setDeckGuideOpen(false)} />
    </div>
  );
}

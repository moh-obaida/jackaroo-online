import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BoardPosition,
  GameAction,
  LegalAction,
  Marble,
  PlayerColor,
} from '../types/game';
import { legalActionToGameAction } from '../lib/game/persistAction';
import {
  getHighlightPositionsForCard,
  positionKey,
} from '../lib/play/boardHighlights';

type UseBoardPlaySelectionArgs = {
  legalActions: LegalAction[];
  selectedCardId: string | null;
  marbles: Marble[];
  playerColor: PlayerColor | null;
  playerId: string;
  isMyTurn: boolean;
  onSubmitAction: (action: GameAction) => Promise<void>;
};

function swapPartnerId(action: LegalAction, selectedMarbleId: string): string | null {
  if (action.type !== 'swap' || !action.swapMarbleId1 || !action.swapMarbleId2) return null;
  if (selectedMarbleId === action.swapMarbleId1) return action.swapMarbleId2;
  if (selectedMarbleId === action.swapMarbleId2) return action.swapMarbleId1;
  return null;
}

/**
 * Board-driven play: card → marble → target hole → submit matching legal action.
 */
export function useBoardPlaySelection({
  legalActions,
  selectedCardId,
  marbles,
  playerColor,
  playerId,
  isMyTurn,
  onSubmitAction,
}: UseBoardPlaySelectionArgs) {
  const [selectedMarbleId, setSelectedMarbleId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSelectedMarbleId(null);
  }, [selectedCardId, isMyTurn]);

  const cardActions = useMemo(() => {
    if (!selectedCardId) return [];
    return legalActions.filter(
      (a) =>
        a.cardId === selectedCardId &&
        a.type !== 'burn_all_cards' &&
        a.type !== 'skip_no_cards'
    );
  }, [legalActions, selectedCardId]);

  const selectableMarbleIds = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedCardId || !playerColor) return ids;

    for (const a of cardActions) {
      if (a.marbleId) ids.add(a.marbleId);
      if (a.type === 'swap') {
        if (a.swapMarbleId1) ids.add(a.swapMarbleId1);
        if (a.swapMarbleId2) ids.add(a.swapMarbleId2);
      }
    }
    return ids;
  }, [cardActions, playerColor, selectedCardId]);

  useEffect(() => {
    if (!isMyTurn || !selectedCardId || selectedMarbleId || submitting) return;
    if (selectableMarbleIds.size !== 1) return;
    setSelectedMarbleId([...selectableMarbleIds][0]);
  }, [isMyTurn, selectedCardId, selectedMarbleId, selectableMarbleIds, submitting]);

  const boardHighlightPositions = useMemo(() => {
    if (!selectedCardId) return [];

    if (!selectedMarbleId) {
      return getHighlightPositionsForCard(legalActions, selectedCardId);
    }

    const out: BoardPosition[] = [];
    const seen = new Set<string>();

    for (const a of cardActions) {
      if (a.type === 'swap' && a.swapMarbleId1 && a.swapMarbleId2) {
        const partnerId = swapPartnerId(a, selectedMarbleId);
        if (!partnerId) continue;
        const partner = marbles.find((m) => m.id === partnerId);
        if (!partner) continue;
        const k = positionKey(partner.position);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(partner.position);
        continue;
      }

      if (a.marbleId && a.marbleId !== selectedMarbleId) continue;
      if (a.targetPosition) {
        const k = positionKey(a.targetPosition);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(a.targetPosition);
      }
    }
    return out;
  }, [cardActions, legalActions, marbles, selectedCardId, selectedMarbleId]);

  const marbleHighlightIds = useMemo(() => {
    if (!isMyTurn || !selectedCardId) return new Set<string>();
    return selectableMarbleIds;
  }, [isMyTurn, selectedCardId, selectableMarbleIds]);

  const playFlowHintKey = useMemo(() => {
    if (!isMyTurn || !selectedCardId || submitting) return null;
    if (selectedMarbleId && boardHighlightPositions.length > 0) {
      return 'game.playFlow.selectTarget';
    }
    if (selectableMarbleIds.size > 0) {
      return 'game.playFlow.selectMarble';
    }
    return null;
  }, [
    isMyTurn,
    selectedCardId,
    submitting,
    selectedMarbleId,
    boardHighlightPositions.length,
    selectableMarbleIds.size,
  ]);

  const submitMatchedAction = useCallback(
    async (match: LegalAction) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        await onSubmitAction(legalActionToGameAction(match, playerId));
        setSelectedMarbleId(null);
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmitAction, playerId, submitting]
  );

  const handleMarbleClick = useCallback(
    (marbleId: string) => {
      if (!isMyTurn || !selectedCardId || submitting) return;
      if (!selectableMarbleIds.has(marbleId)) return;
      setSelectedMarbleId((prev) => (prev === marbleId ? null : marbleId));
    },
    [isMyTurn, selectedCardId, selectableMarbleIds, submitting]
  );

  const handlePositionClick = useCallback(
    async (pos: BoardPosition) => {
      if (!isMyTurn || !selectedCardId || submitting) return;
      const key = positionKey(pos);

      const match = cardActions.find((a) => {
        if (a.type === 'swap') {
          if (!selectedMarbleId) return false;
          const partnerId = swapPartnerId(a, selectedMarbleId);
          if (!partnerId) return false;
          const partner = marbles.find((m) => m.id === partnerId);
          return partner ? positionKey(partner.position) === key : false;
        }

        if (a.targetPosition && positionKey(a.targetPosition) === key) {
          if (a.marbleId && a.marbleId !== selectedMarbleId) return false;
          if (a.marbleId && !selectedMarbleId) return false;
          return true;
        }
        return false;
      });

      if (!match) return;
      await submitMatchedAction(match);
    },
    [
      isMyTurn,
      selectedCardId,
      submitting,
      cardActions,
      selectedMarbleId,
      marbles,
      submitMatchedAction,
    ]
  );

  return {
    selectedMarbleId,
    marbleHighlightIds,
    boardHighlightPositions,
    playFlowHintKey,
    submitting,
    handleMarbleClick,
    handlePositionClick,
  };
}

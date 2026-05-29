import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BoardPosition,
  GameAction,
  LegalAction,
  Marble,
  PlayerColor,
} from '../types/game';
import { legalActionToGameAction } from '../lib/game/persistAction';
import { positionKey } from '../lib/play/boardHighlights';

type UseBoardPlaySelectionArgs = {
  legalActions: LegalAction[];
  selectedCardId: string | null;
  marbles: Marble[];
  playerColor: PlayerColor | null;
  playerId: string;
  isMyTurn: boolean;
  onSubmitAction: (action: GameAction) => Promise<void>;
};

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
      if (a.type === 'bring_out') {
        marbles
          .filter((m) => m.color === playerColor && m.position.type === 'base')
          .forEach((m) => ids.add(m.id));
      }
      if (a.type === 'swap') {
        if (a.swapMarbleId1) ids.add(a.swapMarbleId1);
        if (a.swapMarbleId2) ids.add(a.swapMarbleId2);
      }
    }
    return ids;
  }, [cardActions, marbles, playerColor, selectedCardId]);

  const boardHighlightPositions = useMemo(() => {
    if (!selectedMarbleId) return [];
    const out: BoardPosition[] = [];
    const seen = new Set<string>();

    for (const a of cardActions) {
      if (a.marbleId && a.marbleId !== selectedMarbleId) continue;
      if (a.targetPosition) {
        const k = positionKey(a.targetPosition);
        if (!seen.has(k)) {
          seen.add(k);
          out.push(a.targetPosition);
        }
      }
      if (a.type === 'swap' && a.swapMarbleId1 && a.swapMarbleId2) {
        for (const id of [a.swapMarbleId1, a.swapMarbleId2]) {
          const m = marbles.find((x) => x.id === id);
          if (m) {
            const k = positionKey(m.position);
            if (!seen.has(k)) {
              seen.add(k);
              out.push(m.position);
            }
          }
        }
      }
    }
    return out;
  }, [cardActions, selectedMarbleId, marbles]);

  const marbleHighlightIds = useMemo(() => {
    if (!isMyTurn || !selectedCardId) return new Set<string>();
    return selectableMarbleIds;
  }, [isMyTurn, selectedCardId, selectableMarbleIds]);

  const handleMarbleClick = useCallback(
    (marbleId: string) => {
      if (!isMyTurn || !selectedCardId) return;
      if (!selectableMarbleIds.has(marbleId)) return;

      const bringOutOnly = cardActions.some((a) => a.type === 'bring_out' && !a.marbleId);
      if (bringOutOnly) {
        const action = cardActions.find((a) => a.type === 'bring_out');
        if (action) {
          void onSubmitAction(legalActionToGameAction(action, playerId));
        }
        return;
      }

      setSelectedMarbleId((prev) => (prev === marbleId ? null : marbleId));
    },
    [isMyTurn, selectedCardId, selectableMarbleIds, cardActions, onSubmitAction, playerId]
  );

  const handlePositionClick = useCallback(
    async (pos: BoardPosition) => {
      if (!isMyTurn || !selectedCardId) return;
      const key = positionKey(pos);

      const match = cardActions.find((a) => {
        if (a.targetPosition && positionKey(a.targetPosition) === key) {
          if (a.marbleId && selectedMarbleId && a.marbleId !== selectedMarbleId) return false;
          if (a.marbleId && !selectedMarbleId) return false;
          return true;
        }
        if (a.type === 'swap') {
          const m1 = a.swapMarbleId1 ? marbles.find((m) => m.id === a.swapMarbleId1) : null;
          const m2 = a.swapMarbleId2 ? marbles.find((m) => m.id === a.swapMarbleId2) : null;
          return (
            (m1 && positionKey(m1.position) === key) ||
            (m2 && positionKey(m2.position) === key)
          );
        }
        return false;
      });

      if (!match) return;
      await onSubmitAction(legalActionToGameAction(match, playerId));
      setSelectedMarbleId(null);
    },
    [
      isMyTurn,
      selectedCardId,
      cardActions,
      selectedMarbleId,
      marbles,
      onSubmitAction,
      playerId,
    ]
  );

  return {
    selectedMarbleId,
    marbleHighlightIds,
    boardHighlightPositions,
    handleMarbleClick,
    handlePositionClick,
  };
}

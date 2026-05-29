import { useCallback, useEffect, useState } from 'react';
import { Card, LegalAction } from '../types/game';
import { presentLegalActions } from '../lib/play/presentActions';

/**
 * Turn UX: auto-highlight a sensible card when your turn starts.
 * Rules stay in legalMoves — this only drives selection state.
 */
export function usePlayTurn(
  isMyTurn: boolean,
  turnKey: string,
  hand: Card[],
  legalActions: LegalAction[]
) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showAllActions, setShowAllActions] = useState(false);

  useEffect(() => {
    if (!isMyTurn) {
      setSelectedCardId(null);
      setShowAllActions(false);
      return;
    }

    const view = presentLegalActions(legalActions, null, hand);
    if (view.kind === 'pick_card' && view.suggestedCardId) {
      setSelectedCardId(view.suggestedCardId);
    } else {
      setSelectedCardId(null);
    }
    setShowAllActions(false);
  }, [isMyTurn, turnKey, legalActions, hand]);

  const selectCard = useCallback((id: string | null) => {
    setSelectedCardId(id);
    setShowAllActions(false);
  }, []);

  return {
    selectedCardId,
    setSelectedCardId: selectCard,
    showAllActions,
    setShowAllActions,
  };
}

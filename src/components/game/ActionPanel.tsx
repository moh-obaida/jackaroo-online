import React, { useMemo, useState } from 'react';
import { LegalAction, GameAction } from '../../types/game';
import { useApp } from '../../context/AppContext';

interface ActionPanelProps {
  legalActions: LegalAction[];
  selectedCardId: string | null;
  onSubmitAction: (action: GameAction) => Promise<void>;
  playerId: string;
}

export function ActionPanel({
  legalActions,
  selectedCardId,
  onSubmitAction,
  playerId,
}: ActionPanelProps) {
  const { t } = useApp();
  const [loading, setLoading] = useState(false);

  const grouped = useMemo(() => {
    const burnAll = legalActions.find((a) => a.type === 'burn_all_cards');
    const skip = legalActions.find((a) => a.type === 'skip_no_cards');

    const cardActions = selectedCardId
      ? legalActions.filter(
          (a) =>
            a.cardId === selectedCardId &&
            a.type !== 'burn_all_cards' &&
            a.type !== 'skip_no_cards' &&
            a.type !== 'burn_next_player'
        )
      : [];

    const burnForCard =
      selectedCardId
        ? legalActions.find(
            (a) => a.type === 'burn_next_player' && a.cardId === selectedCardId
          ) || null
        : null;

    return { burnAll, skip, burnForCard, cardActions };
  }, [legalActions, selectedCardId]);

  const handleAction = async (action: LegalAction) => {
    setLoading(true);
    try {
      const gameAction: GameAction = {
        type: action.type,
        playerId,
        cardId: action.cardId || undefined,
        marbleId: action.marbleId,
        targetPosition: action.targetPosition,
        swapMarbleId1: action.swapMarbleId1,
        swapMarbleId2: action.swapMarbleId2,
        splitMoves: action.splitMoves,
        burnTargetPlayerId: action.burnTargetPlayerId,
      };
      await onSubmitAction(gameAction);
    } finally {
      setLoading(false);
    }
  };

  const renderButton = (action: LegalAction, label?: string, variant: 'primary' | 'secondary' = 'secondary') => (
    <button
      key={`${action.type}_${action.cardId}_${action.description}`}
      type="button"
      onClick={() => handleAction(action)}
      disabled={loading}
      className={variant === 'primary' ? 'btn-primary w-full text-sm' : 'btn-secondary w-full text-sm text-start'}
    >
      {label || action.description}
    </button>
  );

  if (grouped.skip) {
    return (
      <div className="card-container space-y-2">
        <h3 className="text-sm font-semibold text-cream-200/80">{t('game.selectAction')}</h3>
        {renderButton(grouped.skip, t('game.noCards'), 'primary')}
      </div>
    );
  }

  if (grouped.burnAll) {
    return (
      <div className="card-container space-y-2">
        <h3 className="text-sm font-semibold text-cream-200/80">{t('game.selectAction')}</h3>
        <p className="text-xs text-cream-200/50">{t('game.noLegalMoves')}</p>
        {renderButton(grouped.burnAll, t('game.burnAll'), 'primary')}
      </div>
    );
  }

  if (!selectedCardId) {
    return (
      <div className="card-container">
        <p className="text-sm text-cream-200/60 text-center">{t('game.selectCard')}</p>
      </div>
    );
  }

  return (
    <div className="card-container">
      <h3 className="text-sm font-semibold text-cream-200/80 mb-2">{t('game.selectAction')}</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {grouped.burnForCard &&
          renderButton(grouped.burnForCard, t('game.burn'), 'primary')}
        {grouped.cardActions.length > 0 ? (
          grouped.cardActions.slice(0, 12).map((action) => renderButton(action))
        ) : !grouped.burnForCard ? (
          <p className="text-sm text-cream-200/50 text-center py-2">{t('game.noLegalForCard')}</p>
        ) : null}
        {grouped.cardActions.length > 12 && (
          <p className="text-xs text-cream-200/40 text-center">
            +{grouped.cardActions.length - 12} more
          </p>
        )}
      </div>
    </div>
  );
}

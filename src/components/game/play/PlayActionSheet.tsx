import React, { useMemo, useState } from 'react';
import { Card, GameAction, LegalAction } from '../../../types/game';
import { legalActionToGameAction } from '../../../lib/game/persistAction';
import { actionLabelKey, presentLegalActions } from '../../../lib/play/presentActions';
import { getPlayStep } from '../../../lib/play/playStep';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../ui/Button';
import { PlayStepBar } from './PlayStepBar';

type PlayActionSheetProps = {
  legalActions: LegalAction[];
  hand: Card[];
  selectedCardId: string | null;
  showAllActions: boolean;
  onToggleShowAll: (open: boolean) => void;
  onSubmitAction: (action: GameAction) => Promise<void>;
  playerId: string;
  isMyTurn: boolean;
};

export function PlayActionSheet({
  legalActions,
  hand,
  selectedCardId,
  showAllActions,
  onToggleShowAll,
  onSubmitAction,
  playerId,
  isMyTurn,
}: PlayActionSheetProps) {
  const { t } = useApp();
  const [loading, setLoading] = useState(false);

  const view = useMemo(
    () => presentLegalActions(legalActions, selectedCardId, hand),
    [legalActions, selectedCardId, hand]
  );

  const step = getPlayStep(isMyTurn, view);

  const run = async (action: LegalAction) => {
    setLoading(true);
    try {
      await onSubmitAction(legalActionToGameAction(action, playerId));
    } finally {
      setLoading(false);
    }
  };

  const labelFor = (action: LegalAction) => {
    const key = actionLabelKey(action.type);
    const fromKey = t(key);
    if (fromKey !== key) return fromKey;
    return action.description;
  };

  const renderActionBtn = (action: LegalAction, variant: 'primary' | 'secondary' = 'secondary') => (
    <Button
      key={`${action.type}_${action.cardId}_${action.description}`}
      variant={variant}
      size="lg"
      fullWidth
      disabled={loading}
      onClick={() => run(action)}
      className={variant === 'secondary' ? 'play-action-btn play-action-btn--alt' : 'play-action-btn'}
    >
      {labelFor(action)}
    </Button>
  );

  return (
    <div className="play-sheet">
      <PlayStepBar step={step} />

      {view.kind === 'skip' && renderActionBtn(view.action, 'primary')}
      {view.kind === 'burn_all' && renderActionBtn(view.action, 'primary')}

      {view.kind === 'play_card' && (
        <>
          {view.primary ? (
            renderActionBtn(view.primary, 'primary')
          ) : (
            <p className="play-sheet__hint">{t('game.noLegalForCard')}</p>
          )}
          {(showAllActions ? view.others : view.others.slice(0, 1)).map((a) => renderActionBtn(a))}
          {(showAllActions ? view.hiddenCount : view.hiddenCount + Math.max(0, view.others.length - 1)) >
            0 && (
            <button
              type="button"
              className="btn-ghost text-xs w-full py-1"
              onClick={() => onToggleShowAll(!showAllActions)}
            >
              {showAllActions
                ? t('game.fewerActions')
                : t('game.moreActions', {
                    count: String(
                      showAllActions
                        ? view.hiddenCount
                        : view.hiddenCount + Math.max(0, view.others.length - 1)
                    ),
                  })}
            </button>
          )}
        </>
      )}
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Card, GameAction, LegalAction } from '../../../types/game';
import { legalActionToGameAction } from '../../../lib/game/persistAction';
import { actionLabelKey, presentLegalActions } from '../../../lib/play/presentActions';
import { NoLegalMoveReasonKey } from '../../../lib/game/explainNoLegalMove';
import { getPlayStep } from '../../../lib/play/playStep';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../ui/Button';
import { PlayStepBar } from './PlayStepBar';

type PlayActionSheetProps = {
  legalActions: LegalAction[];
  hand: Card[];
  selectedCardId: string | null;
  onClearCard?: () => void;
  showAllActions: boolean;
  onToggleShowAll: (open: boolean) => void;
  onSubmitAction: (
    action: GameAction
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  playerId: string;
  isMyTurn: boolean;
  legalMovesReady?: boolean;
  isSubmittingAction?: boolean;
  noLegalReasonKey?: NoLegalMoveReasonKey | null;
  boardFlowHintKey?: string | null;
};

export function PlayActionSheet({
  legalActions,
  hand,
  selectedCardId,
  onClearCard,
  showAllActions,
  onToggleShowAll,
  onSubmitAction,
  playerId,
  isMyTurn,
  legalMovesReady = true,
  isSubmittingAction = false,
  noLegalReasonKey,
  boardFlowHintKey,
}: PlayActionSheetProps) {
  const { t } = useApp();
  const [localLoading, setLocalLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const busy = localLoading || isSubmittingAction;

  const view = useMemo(
    () => presentLegalActions(legalActions, selectedCardId, hand),
    [legalActions, selectedCardId, hand]
  );

  const step = getPlayStep(isMyTurn, view, legalMovesReady, busy);

  const selectedCard = useMemo(
    () => (selectedCardId ? hand.find((c) => c.id === selectedCardId) ?? null : null),
    [hand, selectedCardId]
  );

  const run = async (action: LegalAction) => {
    if (busy) return;
    setLocalLoading(true);
    setSubmitError(null);
    try {
      const result = await onSubmitAction(legalActionToGameAction(action, playerId));
      if (!result.ok) {
        setSubmitError(result.error);
      }
    } finally {
      setLocalLoading(false);
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
      size="md"
      fullWidth
      disabled={busy}
      onClick={() => run(action)}
      className={variant === 'secondary' ? 'play-action-btn play-action-btn--alt' : 'play-action-btn'}
    >
      {labelFor(action)}
    </Button>
  );

  const renderConfirmSummary = (action: LegalAction, confirmLabel?: string) => (
    <div className="play-sheet__summary">
      <p className="play-sheet__summary-text">
        {t('game.actionSummary', {
          card: selectedCard?.rank ?? '—',
          action: labelFor(action),
        })}
      </p>
      <div className="play-sheet__summary-actions">
        <Button variant="primary" size="md" fullWidth disabled={busy} onClick={() => run(action)}>
          {busy ? t('game.submittingMove') : confirmLabel ?? t('game.confirm')}
        </Button>
        {onClearCard && (
          <Button variant="ghost" size="sm" fullWidth disabled={busy} onClick={() => onClearCard()}>
            {t('game.cancel')}
          </Button>
        )}
      </div>
    </div>
  );

  const renderNoLegalPanel = (action: LegalAction) => (
    <div className="play-sheet__no-legal">
      <p className="play-sheet__no-legal-title">{t('game.step.discard_all')}</p>
      {noLegalReasonKey && (
        <p className="play-sheet__no-legal-reason">{t(noLegalReasonKey)}</p>
      )}
      <Button
        variant="primary"
        size="md"
        fullWidth
        disabled={busy}
        onClick={() => void run(action)}
        className="play-sheet__no-legal-btn"
      >
        {busy ? t('game.submittingMove') : t('game.burnAll')}
      </Button>
    </div>
  );

  return (
    <div className={`play-sheet ${busy ? 'play-sheet--busy' : ''}`}>
      <PlayStepBar step={step} />

      {busy && (
        <p className="play-sheet__submitting" role="status" aria-live="polite">
          {t('game.submittingMove')}
        </p>
      )}

      {boardFlowHintKey && isMyTurn && !busy && (
        <p className="play-sheet__hint play-sheet__hint--flow">{t(boardFlowHintKey)}</p>
      )}

      {submitError && (
        <p className="play-sheet__hint play-sheet__hint--error" role="alert">
          {submitError}
        </p>
      )}

      {view.kind === 'skip' && legalMovesReady && renderConfirmSummary(view.action)}
      {view.kind === 'burn_all' && legalMovesReady && renderNoLegalPanel(view.action)}

      {!legalMovesReady && isMyTurn && !busy && (
        <p className="play-sheet__hint play-sheet__hint--loading" role="status" aria-live="polite">
          {t('game.loadingLegalMoves')}
        </p>
      )}

      {view.kind === 'play_card' && legalMovesReady && (
        <>
          {onClearCard && selectedCardId && (
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              disabled={busy}
              onClick={() => onClearCard()}
              className="play-sheet__cancel text-xs"
            >
              {t('game.cancel')}
            </Button>
          )}
          {view.primary ? (
            renderConfirmSummary(view.primary)
          ) : (
            <p className="play-sheet__hint">{t('game.noLegalForCard')}</p>
          )}
          {(showAllActions ? view.others : view.others.slice(0, 1)).map((a) => renderActionBtn(a))}
          {(() => {
            const hiddenCountToShow = showAllActions
              ? view.hiddenCount
              : view.hiddenCount + Math.max(0, view.others.length - 1);
            if (hiddenCountToShow <= 0) return null;
            return (
              <button
                type="button"
                className="btn-ghost text-xs w-full py-1"
                disabled={busy}
                onClick={() => onToggleShowAll(!showAllActions)}
              >
                {showAllActions
                  ? t('game.fewerActions')
                  : t('game.moreActions', { count: String(hiddenCountToShow) })}
              </button>
            );
          })()}
        </>
      )}
    </div>
  );
}

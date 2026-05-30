import React from 'react';
import { Card } from '../../../types/game';
import { useApp } from '../../../context/AppContext';
import { PlayingCard } from '../../cards/PlayingCard';

type BoardCenterPilesProps = {
  deckCount: number;
  discardCount: number;
  topDiscard: Card | undefined;
  onShowDeckGuide: () => void;
};

/** Center of board — top discard face-up with stack depth; deck count below. */
export function BoardCenterPiles({
  deckCount,
  discardCount,
  topDiscard,
  onShowDeckGuide,
}: BoardCenterPilesProps) {
  const { t } = useApp();

  return (
    <div className="board-center-piles" aria-label={t('game.discardTop')}>
      <div className="board-center-piles__main">
        <span className="board-center-piles__label">{t('game.discardTop')}</span>

        <div className="board-center-piles__discard">
          {topDiscard ? (
            <>
              {discardCount > 1 ? (
                <div className="board-center-piles__stack" aria-hidden>
                  <span className="board-center-piles__stack-layer" />
                  {discardCount > 2 ? (
                    <span className="board-center-piles__stack-layer board-center-piles__stack-layer--2" />
                  ) : null}
                </div>
              ) : null}
              <PlayingCard
                card={topDiscard}
                compact={false}
                showHint={false}
                className="pointer-events-none board-center-piles__discard-card"
              />
            </>
          ) : (
            <div className="board-center-piles__discard-empty">
              <span>{t('game.discardEmpty')}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="board-center-piles__deck"
          onClick={onShowDeckGuide}
          aria-label={t('game.deckRemaining', { count: String(deckCount) })}
        >
          <span className="board-center-piles__deck-stack" aria-hidden />
          <span className="board-center-piles__deck-meta">
            <span className="board-center-piles__deck-count tabular-nums">{deckCount}</span>
            <span className="board-center-piles__deck-hint">{t('game.showDeck')}</span>
          </span>
        </button>
      </div>
    </div>
  );
}

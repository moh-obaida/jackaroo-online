import React from 'react';
import { Card } from '../../../types/game';
import { useApp } from '../../../context/AppContext';
import { PlayingCard } from '../../cards/PlayingCard';

type BoardCenterPilesProps = {
  deckCount: number;
  topDiscard: Card | undefined;
  onShowDeckGuide: () => void;
};

/** Center of board — discard pile on top; deck count tucked to the side. */
export function BoardCenterPiles({ deckCount, topDiscard, onShowDeckGuide }: BoardCenterPilesProps) {
  const { t } = useApp();

  return (
    <div className="board-center-piles" aria-label={t('game.discardTop')}>
      <div className="board-center-piles__discard">
        {topDiscard ? (
          <PlayingCard
            card={topDiscard}
            compact={false}
            showHint={false}
            className="pointer-events-none board-center-piles__discard-card"
          />
        ) : (
          <div className="board-center-piles__discard-empty" aria-hidden />
        )}
      </div>

      <button
        type="button"
        className="board-center-piles__deck"
        onClick={onShowDeckGuide}
        aria-label={t('game.deckRemaining', { count: String(deckCount) })}
      >
        <span className="board-center-piles__deck-stack" aria-hidden />
        <span className="board-center-piles__deck-count tabular-nums">{deckCount}</span>
      </button>
    </div>
  );
}

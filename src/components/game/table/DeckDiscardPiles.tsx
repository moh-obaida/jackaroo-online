import React from 'react';
import { GameState } from '../../../types/game';
import { useApp } from '../../../context/AppContext';

type DeckDiscardPilesProps = {
  gameState: GameState;
  onShowDeckGuide: () => void;
};

export function DeckDiscardPiles({ gameState, onShowDeckGuide }: DeckDiscardPilesProps) {
  const { t } = useApp();
  const deckCount = gameState.deck.length;
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];

  return (
    <div className="deck-discard-strip flex items-center gap-3 text-[10px] text-cream-200/55">
      <div className="flex items-center gap-1.5">
        <span className="deck-pile-icon w-7 h-9 rounded border border-wood-700/80 bg-wood-900/80 shadow-inner" />
        <span className="tabular-nums">
          {t('game.deckRemaining', { count: String(deckCount) })}
        </span>
      </div>
      {topDiscard && (
        <span className="tabular-nums truncate max-w-[5rem]">
          {topDiscard.rank}
          {topDiscard.suit[0]?.toUpperCase()}
        </span>
      )}
      <button type="button" onClick={onShowDeckGuide} className="btn-ghost text-[10px] px-2 py-0.5 ms-auto">
        {t('game.showDeck')}
      </button>
    </div>
  );
}

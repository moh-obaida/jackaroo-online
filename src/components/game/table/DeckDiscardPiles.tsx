import React from 'react';
import { GameState } from '../../../types/game';
import { useApp } from '../../../context/AppContext';
import { PlayingCard } from '../../cards/PlayingCard';

type DeckDiscardPilesProps = {
  gameState: GameState;
  onShowDeckGuide: () => void;
};

/**
 * Deck count + top discard face (public). Show Deck = static rank guide only (Manus / CARDS_AND_RULES_REFERENCE).
 */
export function DeckDiscardPiles({ gameState, onShowDeckGuide }: DeckDiscardPilesProps) {
  const { t } = useApp();
  const deckCount = gameState.deck.length;
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];

  return (
    <div className="deck-discard-strip flex items-end gap-3 shrink-0">
      <div className="deck-pile-stack flex flex-col items-center gap-0.5">
        <div className="deck-pile-icon deck-pile-icon--deck" aria-hidden />
        <span className="text-[10px] text-cream-200/55 tabular-nums">
          {t('game.deckRemaining', { count: String(deckCount) })}
        </span>
      </div>

      {topDiscard && (
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-[9px] uppercase tracking-wider text-cream-200/40">
            {t('game.discardTop')}
          </p>
          <PlayingCard card={topDiscard} compact showHint={false} className="pointer-events-none scale-90" />
        </div>
      )}

      <button
        type="button"
        onClick={onShowDeckGuide}
        className="btn-ghost text-[10px] px-2 py-1 ms-auto self-center"
      >
        {t('game.showDeck')}
      </button>
    </div>
  );
}

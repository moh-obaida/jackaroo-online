import React from 'react';
import { GameState } from '../../../types/game';
import { useApp } from '../../../context/AppContext';
import { PlayingCard } from '../../cards/PlayingCard';

type DeckDiscardPilesProps = {
  gameState: GameState;
  onShowDeckGuide: () => void;
  compact?: boolean;
};

/** Deck count + top discard — lives in HUD rail, not over board holes. */
export function DeckDiscardPiles({ gameState, onShowDeckGuide, compact = false }: DeckDiscardPilesProps) {
  const { t } = useApp();
  const deckCount = gameState.deck.length;
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];

  return (
    <div className={`deck-discard-strip ${compact ? 'deck-discard-strip--compact' : ''}`}>
      <div className="deck-pile-stack" aria-label={t('game.deckRemaining', { count: String(deckCount) })}>
        <div className="deck-pile-icon deck-pile-icon--deck deck-pile-icon--compact" aria-hidden />
        <span className="deck-discard-strip__count tabular-nums">
          {deckCount}
        </span>
      </div>

      {topDiscard ? (
        <div className="deck-discard-strip__discard">
          <span className="deck-discard-strip__label">{t('game.discardTop')}</span>
          <PlayingCard card={topDiscard} compact showHint={false} className="pointer-events-none deck-discard-strip__card" />
        </div>
      ) : (
        <span className="deck-discard-strip__empty">{t('game.discardEmpty')}</span>
      )}

      <button type="button" onClick={onShowDeckGuide} className="deck-discard-strip__guide">
        {t('game.showDeck')}
      </button>
    </div>
  );
}

import React from 'react';
import { GameState } from '../../types/game';
import { useApp } from '../../context/AppContext';
import { CardBack, PlayingCard } from '../cards/PlayingCard';

interface DeckInfoPanelProps {
  gameState: GameState;
  onShowDeckGuide: () => void;
}

export function DeckInfoPanel({ gameState, onShowDeckGuide }: DeckInfoPanelProps) {
  const { t } = useApp();
  const discardCount = gameState.discardPile?.length ?? 0;
  const topDiscard =
    discardCount > 0 ? gameState.discardPile[discardCount - 1] : null;

  return (
    <div className="card-container-compact space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-cream-200/80">{t('game.discardPile')}</h3>
        <button type="button" onClick={onShowDeckGuide} className="btn-secondary text-xs px-3 py-1.5">
          {t('game.showDeck')}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <CardBack compact />
          <div className="text-xs">
            <p className="text-cream-200/70 font-medium">{t('game.deckHidden')}</p>
            <p className="text-cream-200/40 mt-0.5">{t('deckGuide.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-wood-800/50">
        <div className="text-xs text-cream-200/60">
          <span className="text-cream-200/45">{t('game.discardPile')}:</span>{' '}
          <span className="font-medium tabular-nums text-cream-100">{discardCount}</span>
        </div>
        {topDiscard ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-cream-200/45">{t('game.discardTop')}</span>
            <PlayingCard card={topDiscard} compact showHint={false} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

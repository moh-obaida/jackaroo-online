import React from 'react';
import { Card } from '../../types/game';
import { useApp } from '../../context/AppContext';
import { PlayingCard } from './PlayingCard';

interface PlayerHandProps {
  cards: Card[];
  selectedCardId: string | null;
  playableCardIds?: string[];
  onSelectCard: (cardId: string | null) => void;
  disabled: boolean;
  docked?: boolean;
}

export function PlayerHand({
  cards,
  selectedCardId,
  playableCardIds = [],
  onSelectCard,
  disabled,
  docked = false,
}: PlayerHandProps) {
  const { t } = useApp();
  const playable = new Set(playableCardIds);

  if (cards.length === 0) {
    return <div className="text-center text-cream-200/45 text-sm py-4">{t('game.noCards')}</div>;
  }

  return (
    <div className={`player-hand ${docked ? 'player-hand--docked' : ''}`}>
      {cards.map((card, index) => {
        const isSelected = selectedCardId === card.id;
        const canPlay = !disabled && playable.has(card.id);
        const offset = docked ? Math.max(-3, Math.min(index - (cards.length - 1) / 2, 3)) : 0;

        return (
          <div
            key={card.id}
            className={`player-hand__slot ${isSelected ? 'player-hand__slot--selected' : ''}`}
            style={
              docked
                ? {
                    transform: `rotate(${offset * 1.6}deg) translateY(${Math.abs(offset) * 1.5}px)`,
                  }
                : undefined
            }
          >
            <PlayingCard
              card={card}
              compact={docked}
              selected={isSelected}
              playable={canPlay && !isSelected}
              disabled={disabled}
              showHint={docked}
              onClick={() => {
                if (disabled) return;
                onSelectCard(isSelected ? null : card.id);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import { Card } from '../../types/game';
import { useApp } from '../../context/AppContext';
import { PlayingCard } from './PlayingCard';

interface PlayerHandProps {
  cards: Card[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string | null) => void;
  disabled: boolean;
}

export function PlayerHand({ cards, selectedCardId, onSelectCard, disabled }: PlayerHandProps) {
  const { t } = useApp();

  if (cards.length === 0) {
    return <div className="text-center text-cream-200/45 text-sm py-4">{t('game.noCards')}</div>;
  }

  return (
    <div className="flex flex-wrap gap-2 sm:gap-2.5 justify-center py-1 px-0.5">
      {cards.map((card) => {
        const isSelected = selectedCardId === card.id;
        return (
          <PlayingCard
            key={card.id}
            card={card}
            selected={isSelected}
            disabled={disabled}
            showHint
            onClick={() => {
              if (disabled) return;
              onSelectCard(isSelected ? null : card.id);
            }}
          />
        );
      })}
    </div>
  );
}

import React from 'react';
import { Card } from '../../types/game';
import { useApp } from '../../context/AppContext';
import { PlayingCard } from './PlayingCard';

interface PlayerHandProps {
  cards: Card[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string | null) => void;
  disabled: boolean;
  docked?: boolean;
}

export function PlayerHand({ cards, selectedCardId, onSelectCard, disabled, docked = false }: PlayerHandProps) {
  const { t } = useApp();

  if (cards.length === 0) {
    return <div className="text-center text-cream-200/45 text-sm py-4">{t('game.noCards')}</div>;
  }

  const layoutClass = docked
    ? 'flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 px-1 snap-x snap-mandatory justify-start sm:justify-center scrollbar-thin'
    : 'flex flex-wrap gap-2 sm:gap-2.5 justify-center py-1 px-0.5';

  return (
    <div className={layoutClass}>
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

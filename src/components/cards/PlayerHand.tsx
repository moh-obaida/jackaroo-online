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

<<<<<<< HEAD
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
=======
export function PlayerHand({ cards, selectedCardId, onSelectCard, disabled, docked = false }: PlayerHandProps) {
  const { t } = useApp();
>>>>>>> origin/main

  if (cards.length === 0) {
    return <div className="text-center text-cream-200/45 text-sm py-4">{t('game.noCards')}</div>;
  }

<<<<<<< HEAD
  return (
    <div className={`player-hand ${docked ? 'player-hand--docked' : ''}`}>
      {cards.map((card, index) => {
=======
  const layoutClass = docked
    ? 'flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 px-1 snap-x snap-mandatory justify-start sm:justify-center scrollbar-thin'
    : 'flex flex-wrap gap-2 sm:gap-2.5 justify-center py-1 px-0.5';

  return (
    <div className={layoutClass}>
      {cards.map((card) => {
>>>>>>> origin/main
        const isSelected = selectedCardId === card.id;
        const canPlay = !disabled && playable.has(card.id);
        const offset = docked ? Math.min(index - (cards.length - 1) / 2, 3) : 0;

        return (
<<<<<<< HEAD
          <div
            key={card.id}
            className={`player-hand__slot ${isSelected ? 'player-hand__slot--selected' : ''}`}
            style={
              docked
                ? {
                    transform: `rotate(${offset * 2.5}deg) translateY(${Math.abs(offset) * 2}px)`,
                  }
                : undefined
            }
          >
            <PlayingCard
              card={card}
              selected={isSelected}
              playable={canPlay && !isSelected}
              disabled={disabled}
              showHint
              onClick={() => {
                if (disabled) return;
                onSelectCard(isSelected ? null : card.id);
              }}
            />
          </div>
=======
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
>>>>>>> origin/main
        );
      })}
    </div>
  );
}

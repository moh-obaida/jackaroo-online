import React from 'react';
import { Card } from '../../types/game';
import { useApp } from '../../context/AppContext';

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

  const getSuitSymbol = (suit: string): string => {
    switch (suit) {
      case 'hearts':
        return '♥';
      case 'diamonds':
        return '♦';
      case 'clubs':
        return '♣';
      case 'spades':
        return '♠';
      default:
        return '';
    }
  };

  const isRed = (suit: string) => suit === 'hearts' || suit === 'diamonds';

  return (
    <div className="flex flex-wrap gap-2 justify-center py-1">
      {cards.map((card) => {
        const isSelected = selectedCardId === card.id;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => {
              if (disabled) return;
              onSelectCard(isSelected ? null : card.id);
            }}
            disabled={disabled}
            className={`
              relative w-[3.25rem] h-[4.5rem] sm:w-14 sm:h-20 rounded-lg border-2 transition-all duration-200
              flex flex-col items-center justify-between py-1.5 px-1
              bg-gradient-to-b from-white to-gray-100 shadow-md
              ${isSelected
                ? 'border-gold-400 ring-2 ring-gold-400/40 -translate-y-2 scale-105 z-10'
                : 'border-gray-300 hover:border-gold-300/80 hover:-translate-y-0.5'
              }
              ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`text-xs font-bold self-start leading-none ${isRed(card.suit) ? 'text-red-600' : 'text-gray-900'}`}
            >
              {card.rank}
            </span>
            <span
              className={`text-xl sm:text-2xl leading-none ${isRed(card.suit) ? 'text-red-600' : 'text-gray-900'}`}
            >
              {getSuitSymbol(card.suit)}
            </span>
            <span
              className={`text-xs font-bold self-end leading-none rotate-180 ${isRed(card.suit) ? 'text-red-600' : 'text-gray-900'}`}
            >
              {card.rank}
            </span>
          </button>
        );
      })}
    </div>
  );
}

import React from 'react';
import { Card } from '../../types/game';

interface PlayerHandProps {
  cards: Card[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string | null) => void;
  disabled: boolean;
}

export function PlayerHand({ cards, selectedCardId, onSelectCard, disabled }: PlayerHandProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-4">
        No cards
      </div>
    );
  }

  const getSuitSymbol = (suit: string): string => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  const getSuitColor = (suit: string): string => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-gray-800';
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {cards.map((card) => {
        const isSelected = selectedCardId === card.id;
        return (
          <button
            key={card.id}
            onClick={() => {
              if (disabled) return;
              onSelectCard(isSelected ? null : card.id);
            }}
            disabled={disabled}
            className={`
              relative w-14 h-20 rounded-lg border-2 transition-all duration-200
              flex flex-col items-center justify-center
              ${isSelected
                ? 'border-gold-400 bg-white shadow-lg shadow-gold-400/30 -translate-y-2 scale-105'
                : 'border-gray-300 bg-white hover:border-gold-300 hover:-translate-y-1'
              }
              ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className={`text-xs font-bold ${getSuitColor(card.suit)}`}>
              {card.rank}
            </span>
            <span className={`text-lg ${getSuitColor(card.suit)}`}>
              {getSuitSymbol(card.suit)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

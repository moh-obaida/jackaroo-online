import React from 'react';
import { Card, CardRank } from '../../types/game';
import { getCardCenterValue, getCardHintKey } from '../../lib/game/cardGuide';
import { useApp } from '../../context/AppContext';

export interface PlayingCardProps {
  card: Card;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  showHint?: boolean;
  onClick?: () => void;
  className?: string;
}

function suitSymbol(suit: Card['suit']): string {
  switch (suit) {
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
    case 'spades':
      return '♠';
  }
}

function isRedSuit(suit: Card['suit']): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

function cornerRank(rank: CardRank): string {
  if (rank === '10') return '10';
  return rank;
}

export function PlayingCard({
  card,
  selected = false,
  disabled = false,
  compact = false,
  showHint = true,
  onClick,
  className = '',
}: PlayingCardProps) {
  const { t } = useApp();
  const red = isRedSuit(card.suit);
  const ink = red ? 'text-red-700' : 'text-neutral-900';
  const center = getCardCenterValue(card.rank);
  const hint = showHint ? t(getCardHintKey(card.rank)) : '';

  const w = compact ? 'w-[3.5rem]' : 'w-[4.25rem] sm:w-[4.75rem]';
  const h = compact ? 'h-[5rem]' : 'h-[6.25rem] sm:h-[6.75rem]';

  const inner = (
    <>
      <div className={`absolute inset-0 rounded-[10px] border border-neutral-300/90 bg-gradient-to-b from-[#faf8f4] to-[#ece6dc] shadow-sm ${selected ? 'ring-2 ring-gold-400 ring-offset-1 ring-offset-transparent' : ''}`} />

      <div className={`relative z-10 flex flex-col h-full p-1.5 ${ink}`}>
        <div className="flex items-start justify-between leading-none">
          <div className="flex flex-col items-start">
            <span className={`font-bold ${compact ? 'text-[10px]' : 'text-xs'}`}>{cornerRank(card.rank)}</span>
            <span className={compact ? 'text-sm' : 'text-base'}>{suitSymbol(card.suit)}</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <span
            className={`font-bold tabular-nums tracking-tight ${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'} ${card.rank === 'A' || card.rank === 'J' ? 'text-3xl sm:text-[2rem]' : ''}`}
          >
            {center}
          </span>
        </div>

        {showHint && hint && (
          <p
            className={`text-center leading-tight text-neutral-600 font-medium ${compact ? 'text-[7px]' : 'text-[8px] sm:text-[9px]'} line-clamp-2`}
          >
            {hint}
          </p>
        )}

        <div className={`flex flex-col items-end self-end leading-none rotate-180 ${compact ? 'opacity-80' : ''}`}>
          <span className={`font-bold ${compact ? 'text-[10px]' : 'text-xs'}`}>{cornerRank(card.rank)}</span>
          <span className={compact ? 'text-sm' : 'text-base'}>{suitSymbol(card.suit)}</span>
        </div>
      </div>
    </>
  );

  const baseClass = `relative ${w} ${h} shrink-0 transition-all duration-200 ${className} ${
    selected ? '-translate-y-2 scale-[1.04] z-20 shadow-lg shadow-gold-500/20' : 'hover:-translate-y-0.5 hover:shadow-md'
  } ${disabled ? 'opacity-45 saturate-[0.65] cursor-not-allowed' : onClick ? 'cursor-pointer' : ''}`;

  if (onClick) {
    return (
      <button type="button" className={baseClass} onClick={onClick} disabled={disabled} aria-pressed={selected}>
        {inner}
      </button>
    );
  }

  return <div className={baseClass}>{inner}</div>;
}

/** Decorative card back — does not represent a real hidden card identity. */
export function CardBack({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  const w = compact ? 'w-10' : 'w-12';
  const h = compact ? 'h-14' : 'h-[4.25rem]';
  return (
    <div
      className={`${w} ${h} rounded-lg border border-red-900/60 bg-gradient-to-br from-red-800 via-red-900 to-[#3d1810] shadow-md flex items-center justify-center ${className}`}
      aria-hidden
    >
      <div className="text-[8px] font-bold text-red-100/90 tracking-widest uppercase text-center px-1 leading-tight">
        Jakaroo
      </div>
    </div>
  );
}

import React from 'react';
import { Card, CardRank } from '../../types/game';
<<<<<<< HEAD
import {
  getCardCenterValue,
  getCardFaceActionKey,
  getCardHintKey,
} from '../../lib/game/cardGuide';
=======
import { getCardCenterValue, getCardHintKey } from '../../lib/game/cardGuide';
>>>>>>> origin/main
import { useApp } from '../../context/AppContext';

export interface PlayingCardProps {
  card: Card;
  selected?: boolean;
<<<<<<< HEAD
  /** Legal to play this turn — subtle gold ring (not selected). */
  playable?: boolean;
  disabled?: boolean;
  compact?: boolean;
  /** Short hint in hand; face always shows primary action line */
=======
  disabled?: boolean;
  compact?: boolean;
>>>>>>> origin/main
  showHint?: boolean;
  onClick?: () => void;
  className?: string;
}

<<<<<<< HEAD
=======
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

>>>>>>> origin/main
function cornerRank(rank: CardRank): string {
  if (rank === '10') return '10';
  return rank;
}

<<<<<<< HEAD
/** Face layout inspired by physical Jackaroo cards: white face, bold center value, action text. */
export function PlayingCard({
  card,
  selected = false,
  playable = false,
=======
export function PlayingCard({
  card,
  selected = false,
>>>>>>> origin/main
  disabled = false,
  compact = false,
  showHint = true,
  onClick,
  className = '',
}: PlayingCardProps) {
<<<<<<< HEAD
  const { t, language } = useApp();
  const center = getCardCenterValue(card.rank);
  const faceAction = t(getCardFaceActionKey(card.rank));
  const handHint = showHint ? t(getCardHintKey(card.rank)) : '';

  const w = compact ? 'w-[3.75rem]' : 'w-[4.5rem] sm:w-[5rem]';
  const h = compact ? 'h-[5.25rem]' : 'h-[6.75rem] sm:h-[7.25rem]';

  const inner = (
    <div
      className={`jackaroo-card-face relative h-full w-full overflow-hidden rounded-xl border-2 ${
        selected ? 'border-gold-400' : 'border-neutral-200'
      } bg-white text-neutral-900 shadow-md`}
    >
      {/* Corner indices (K + 13 style on physical King cards) */}
      <div className="absolute top-1 inset-x-1.5 flex justify-between items-start leading-none pointer-events-none">
        <span className={`font-black ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {cornerRank(card.rank)}
        </span>
        {card.rank === 'K' && (
          <span className={`font-bold text-neutral-500 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
            13
          </span>
        )}
      </div>

      {/* Primary action (Arabic or English from deckGuide — rules reference only) */}
      <p
        className={`absolute top-5 inset-x-1 text-center font-medium text-neutral-600 leading-tight ${
          language === 'ar' ? 'text-[8px] sm:text-[9px]' : 'text-[7px] sm:text-[8px]'
        } line-clamp-2`}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {faceAction}
      </p>

      {/* Center value — hero element like physical deck */}
      <div className="absolute inset-0 flex items-center justify-center pt-3 pb-8 pointer-events-none">
        <span
          className={`font-black tabular-nums tracking-tighter text-neutral-900 ${
            compact ? 'text-3xl' : 'text-4xl sm:text-5xl'
          }`}
        >
          {center}
        </span>
      </div>

      {/* Hand hint strip (shorter) */}
      {handHint && (
        <p
          className={`absolute bottom-1 inset-x-1 text-center font-semibold text-red-800/90 leading-tight ${
            compact ? 'text-[6px]' : 'text-[7px]'
          } line-clamp-1`}
        >
          {handHint}
        </p>
      )}

      <div className="absolute bottom-6 end-1.5 rotate-180 leading-none opacity-40 pointer-events-none">
        <span className={`font-black ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {cornerRank(card.rank)}
        </span>
      </div>
    </div>
  );

  const baseClass = `playing-card-v2 relative ${w} ${h} shrink-0 transition-all duration-200 ${className} ${
    selected ? 'playing-card-v2--selected -translate-y-3' : playable ? 'playing-card-v2--playable' : ''
  } ${disabled ? 'opacity-45 cursor-not-allowed' : onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`;

  if (onClick) {
    return (
      <button
        type="button"
        className={baseClass}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={`${card.rank}, ${faceAction}`}
      >
=======
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
>>>>>>> origin/main
        {inner}
      </button>
    );
  }

  return <div className={baseClass}>{inner}</div>;
}

<<<<<<< HEAD
/** Card back — red Jackaroo deck (جاكارو / JACKAROO), no rank leak */
export function CardBack({
  compact = false,
  className = '',
  style,
}: {
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { language } = useApp();
  const w = compact ? 'w-10' : 'w-12 sm:w-14';
  const h = compact ? 'h-14' : 'h-[4.5rem] sm:h-[5.25rem]';

  return (
    <div
      className={`${w} ${h} rounded-xl border-2 border-red-950/80 overflow-hidden shadow-lg ${className}`}
      style={{
        background:
          'linear-gradient(145deg, #c41e2a 0%, #9b1520 45%, #6d0f18 100%)',
        ...style,
      }}
      aria-hidden
    >
      <div className="h-full w-full flex flex-col items-center justify-center p-1 relative">
        <div
          className="absolute inset-2 rounded-lg border border-white/15 opacity-60"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 4l2 4 4 2-4 2-2 4-2-4-4-2 4-2z' fill='%23ffffff' fill-opacity='0.06'/%3E%3C/svg%3E")`,
          }}
        />
        <span
          className="relative text-white font-bold leading-none mt-1"
          style={{ fontSize: compact ? '11px' : '13px' }}
          dir="rtl"
        >
          جاكارو
        </span>
        <span className="relative text-[7px] sm:text-[8px] font-bold text-white/90 tracking-[0.15em] uppercase mt-0.5">
          Jackaroo
        </span>
        {language === 'en' && (
          <span className="relative text-[6px] text-white/50 mt-1 uppercase tracking-widest">
            Jakaroo
          </span>
        )}
=======
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
>>>>>>> origin/main
      </div>
    </div>
  );
}

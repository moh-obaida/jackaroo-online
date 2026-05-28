import React from 'react';
import { Card, CardRank } from '../../types/game';
import {
  getCardCenterValue,
  getCardFaceActionKey,
  getCardHintKey,
} from '../../lib/game/cardGuide';
import { useApp } from '../../context/AppContext';

export interface PlayingCardProps {
  card: Card;
  selected?: boolean;
  /** Legal to play this turn — subtle gold ring (not selected). */
  playable?: boolean;
  disabled?: boolean;
  compact?: boolean;
  /** Short hint in hand; face always shows primary action line */
  showHint?: boolean;
  onClick?: () => void;
  className?: string;
}

function cornerRank(rank: CardRank): string {
  if (rank === '10') return '10';
  return rank;
}

/** Face layout inspired by physical Jackaroo cards: white face, bold center value, action text. */
export function PlayingCard({
  card,
  selected = false,
  playable = false,
  disabled = false,
  compact = false,
  showHint = true,
  onClick,
  className = '',
}: PlayingCardProps) {
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
        {inner}
      </button>
    );
  }

  return <div className={baseClass}>{inner}</div>;
}

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
      </div>
    </div>
  );
}

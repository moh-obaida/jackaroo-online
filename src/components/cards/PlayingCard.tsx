import React from 'react';
import { Card } from '../../types/game';
import { getCardHintKey } from '../../lib/game/cardGuide';
import { useApp } from '../../context/AppContext';
import { CardFace, CardFaceBack } from './CardFace';

export interface PlayingCardProps {
  card: Card;
  selected?: boolean;
  playable?: boolean;
  disabled?: boolean;
  compact?: boolean;
  showHint?: boolean;
  onClick?: () => void;
  className?: string;
}

function cardFaceState(
  selected: boolean,
  playable: boolean,
  disabled: boolean
): 'normal' | 'selected' | 'playable' | 'disabled' {
  if (disabled) return 'disabled';
  if (selected) return 'selected';
  if (playable) return 'playable';
  return 'normal';
}

/** Gameplay card — physical Jakaroo face via CardFace. */
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
  const variant = compact ? 'hand' : 'standard';
  const state = cardFaceState(selected, playable, disabled);
  const hint = t(getCardHintKey(card.rank));

  const shellClass = [
    'playing-card-shell',
    compact ? 'playing-card-shell--hand' : 'playing-card-shell--standard',
    selected ? 'playing-card-shell--selected' : '',
    playable && !selected ? 'playing-card-shell--playable' : '',
    onClick && !disabled ? 'playing-card-shell--clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const face = (
    <CardFace
      rank={card.rank}
      variant={variant}
      state={state}
      showHandHint={showHint && compact}
    />
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={shellClass}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={`${card.rank}, ${hint}`}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {face}
      </button>
    );
  }

  return (
    <div className={shellClass} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {face}
    </div>
  );
}

export function CardBack({
  compact = false,
  className = '',
  style,
}: {
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const w = compact ? 'w-10' : 'w-12 sm:w-14';
  const h = compact ? 'h-14' : 'h-[4.5rem] sm:h-[5.25rem]';

  return (
    <div className={`${w} ${h} shrink-0 ${className}`} style={style}>
      <CardFaceBack compact={compact} className="h-full w-full" />
    </div>
  );
}

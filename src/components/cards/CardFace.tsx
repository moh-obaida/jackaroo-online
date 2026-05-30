import React from 'react';
import { CardRank, CardSuit } from '../../types/game';
import {
  CardFaceVariant,
  getCardCenterValue,
  getCardFaceMeta,
  getSuitSymbol,
} from '../../lib/game/cardFaceContent';
import {
  CARD_IMAGE_ASSETS_AVAILABLE,
  cardRankNeedsHandFlip,
  getCardRankImageSrc,
} from '../../lib/cards/cardAssets';
import { useApp } from '../../context/AppContext';
import { CardRuleText } from './CardRuleText';

export type CardFaceState = 'normal' | 'selected' | 'playable' | 'disabled' | 'opponentBack';

export type CardFaceProps = {
  rank: CardRank;
  suit?: CardSuit;
  variant?: CardFaceVariant;
  state?: CardFaceState;
  /** Hand dock: show short action strip (CSS fallback only) */
  showHandHint?: boolean;
  className?: string;
};

function SuitPip({ suit, className = '' }: { suit?: CardSuit; className?: string }) {
  if (!suit) return null;
  const { symbol, tone } = getSuitSymbol(suit);
  return (
    <span className={`card-face__suit card-face__suit--${tone} ${className}`.trim()} aria-hidden="true">
      {symbol}
    </span>
  );
}

function CardFaceImage({
  rank,
  variant,
  stateClass,
  className,
}: {
  rank: CardRank;
  variant: CardFaceVariant;
  stateClass: string;
  className: string;
}) {
  const src = getCardRankImageSrc(rank);
  if (!src) return null;

  const isHand = variant === 'hand';
  const flip = isHand && cardRankNeedsHandFlip(rank);

  return (
    <div
      className={`card-face card-face--image card-face--${variant} ${stateClass} ${className}`.trim()}
    >
      <div
        className={[
          'card-face__img-wrap',
          isHand ? 'card-face__img-wrap--hand' : '',
          flip ? 'card-face__img-wrap--flip' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <img src={src} alt="" className="card-face__img" draggable={false} decoding="async" />
      </div>
    </div>
  );
}

/**
 * Jakaroo card face — polished PNG art when available, CSS fallback otherwise.
 * Hand variant crops the top half so mirrored bottom text never reads upside down.
 */
export function CardFace({
  rank,
  suit,
  variant = 'standard',
  state = 'normal',
  showHandHint = false,
  className = '',
}: CardFaceProps) {
  const { t, language } = useApp();
  const meta = getCardFaceMeta(rank);
  const centerValue = getCardCenterValue(rank, variant);
  const isHand = variant === 'hand';

  const stateClass =
    state === 'selected'
      ? 'card-face--selected'
      : state === 'playable'
        ? 'card-face--playable'
        : state === 'disabled'
          ? 'card-face--disabled'
          : '';

  if (CARD_IMAGE_ASSETS_AVAILABLE && getCardRankImageSrc(rank)) {
    return <CardFaceImage rank={rank} variant={variant} stateClass={stateClass} className={className} />;
  }

  if (isHand) {
    const actionLabel = meta.centerTopKey ? t(meta.centerTopKey) : '';
    return (
      <div
        className={`card-face card-face--hand ${stateClass} ${className}`.trim()}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="card-face__inner">
          <div className="card-face__corner card-face__corner--tl">
            <span className="card-face__rank">{meta.cornerRank}</span>
            {meta.cornerNumeric && meta.cornerNumeric !== meta.cornerRank ? (
              <span className="card-face__numeric">{meta.cornerNumeric}</span>
            ) : null}
            <SuitPip suit={suit} />
          </div>

          <div className="card-face__hero">
            <span className="card-face__hero-rank">{centerValue}</span>
            {showHandHint && actionLabel ? (
              <span className="card-face__hero-action">{actionLabel}</span>
            ) : null}
          </div>

          <span className="card-face__corner card-face__corner--br" aria-hidden="true">
            <span className="card-face__rank">{meta.cornerRank}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card-face card-face--${variant} ${stateClass} ${className}`.trim()}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="card-face__inner">
        <div className="card-face__corner card-face__corner--tl">
          <span className="card-face__rank">{meta.cornerRank}</span>
          {meta.faceLabelKey ? (
            <span className="card-face__face-label">{t(meta.faceLabelKey)}</span>
          ) : null}
          {meta.cornerNumeric ? <span className="card-face__numeric">{meta.cornerNumeric}</span> : null}
        </div>
        <SuitPip suit={suit} className="card-face__suit--tr" />

        <div className="card-face__center">
          {meta.centerTopKey ? (
            <span className={`card-face__center-label card-face__center-label--${meta.centerTopTone ?? 'red'}`}>
              {t(meta.centerTopKey)}
            </span>
          ) : null}
          <span className="card-face__center-value">{centerValue}</span>
          {meta.centerBottomKey ? (
            <span
              className={`card-face__center-label card-face__center-label--${meta.centerBottomTone ?? 'blue'}`}
            >
              {t(meta.centerBottomKey)}
            </span>
          ) : null}
        </div>

        {meta.ruleLines.length > 0 ? (
          <CardRuleText lines={meta.ruleLines} className="card-face__rules" />
        ) : null}

        <span className="card-face__corner card-face__corner--br" aria-hidden="true">
          <span className="card-face__rank">{meta.cornerRank}</span>
        </span>
      </div>
    </div>
  );
}

/** Dark premium card back — no rank leak */
export function CardFaceBack({
  compact = false,
  className = '',
  style,
}: {
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`card-face-back ${compact ? 'card-face-back--compact' : ''} ${className}`.trim()}
      style={style}
      aria-hidden
    >
      <div className="card-face-back__frame">
        <span className="card-face-back__mark" dir="rtl">
          جاكارو
        </span>
        <span className="card-face-back__sub">Jakaroo</span>
      </div>
    </div>
  );
}

import React from 'react';
import { CardRank } from '../../types/game';
import {
  CardFaceVariant,
  getCardCenterValue,
  getCardFaceMeta,
} from '../../lib/game/cardFaceContent';
import { getCardHintKey } from '../../lib/game/cardGuide';
import { useApp } from '../../context/AppContext';
import { CardRuleText } from './CardRuleText';

export type CardFaceState = 'normal' | 'selected' | 'playable' | 'disabled' | 'opponentBack';

export type CardFaceProps = {
  rank: CardRank;
  variant?: CardFaceVariant;
  state?: CardFaceState;
  /** Hand dock: show short action strip */
  showHandHint?: boolean;
  className?: string;
};

function CardFaceEndCap({
  rank,
  variant,
  showRules,
}: {
  rank: CardRank;
  variant: CardFaceVariant;
  showRules: boolean;
}) {
  const { t } = useApp();
  const meta = getCardFaceMeta(rank);
  const isGuide = variant === 'guide';

  return (
    <div className={`card-face-end ${isGuide ? 'card-face-end--guide' : 'card-face-end--compact'}`}>
      <div className="card-face-corners">
        <div className="card-face-corners__left">
          <span className="card-face-corners__rank">{meta.cornerRank}</span>
          {meta.faceLabelKey ? (
            <span className="card-face-corners__face-label">{t(meta.faceLabelKey)}</span>
          ) : null}
        </div>
        {meta.cornerNumeric ? (
          <span className="card-face-corners__numeric">{meta.cornerNumeric}</span>
        ) : null}
      </div>
      {showRules && meta.ruleLines.length > 0 ? (
        <CardRuleText lines={meta.ruleLines} className="card-face-rules" />
      ) : null}
    </div>
  );
}

/**
 * Physical Jakaroo card face — white, blue border, rotated bottom half (180°, not mirrored).
 */
export function CardFace({
  rank,
  variant = 'standard',
  state = 'normal',
  showHandHint = false,
  className = '',
}: CardFaceProps) {
  const { t, language } = useApp();
  const meta = getCardFaceMeta(rank);
  const centerValue = getCardCenterValue(rank, variant);
  const isHand = variant === 'hand';
  const showFullLayout = !isHand;
  const handHint = showHandHint ? t(getCardHintKey(rank)) : '';

  const stateClass =
    state === 'selected'
      ? 'card-face--selected'
      : state === 'playable'
        ? 'card-face--playable'
        : state === 'disabled'
          ? 'card-face--disabled'
          : '';

  return (
    <div
      className={`card-face card-face--${variant} ${stateClass} ${className}`.trim()}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="card-face__inner">
        {showFullLayout ? (
          <>
            <CardFaceEndCap rank={rank} variant={variant} showRules />
            <div className="card-face-center">
              {meta.centerTopKey ? (
                <span className={`card-face-center__label card-face-center__label--${meta.centerTopTone ?? 'red'}`}>
                  {t(meta.centerTopKey)}
                </span>
              ) : null}
              <span className="card-face-center__value">{centerValue}</span>
              {meta.centerBottomKey ? (
                <span
                  className={`card-face-center__label card-face-center__label--${meta.centerBottomTone ?? 'blue'}`}
                >
                  {t(meta.centerBottomKey)}
                </span>
              ) : null}
            </div>
            {/* Opposite-player orientation: rotate 180° (not scaleX mirror) */}
            <div className="card-face-bottom" aria-hidden="true">
              <CardFaceEndCap rank={rank} variant={variant} showRules />
            </div>
          </>
        ) : (
          <>
            <div className="card-face-corners card-face-corners--hand">
              <span className="card-face-corners__rank">{meta.cornerRank}</span>
              {meta.cornerNumeric && meta.cornerNumeric !== meta.cornerRank ? (
                <span className="card-face-corners__numeric">{meta.cornerNumeric}</span>
              ) : null}
            </div>
            <div className="card-face-center card-face-center--hand">
              <span className="card-face-center__value">{centerValue}</span>
            </div>
            {handHint ? <p className="card-face-hand-hint">{handHint}</p> : null}
            <div className="card-face-hand-index" aria-hidden="true">
              <span className="card-face-corners__rank">{meta.cornerRank}</span>
            </div>
          </>
        )}
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

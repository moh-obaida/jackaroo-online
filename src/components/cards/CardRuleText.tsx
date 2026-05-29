import React from 'react';
import { useApp } from '../../context/AppContext';
import type { CardFaceSegment } from '../../lib/game/cardFaceContent';

type CardRuleTextProps = {
  lines: CardFaceSegment[][];
  className?: string;
};

export function CardRuleText({ lines, className = '' }: CardRuleTextProps) {
  const { t, language } = useApp();

  return (
    <div className={`card-rule-text ${className}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {lines.map((segments, lineIndex) => (
        <p key={lineIndex} className="card-rule-text__line">
          {segments.map((seg, segIndex) => {
            const tone = seg.tone ?? 'black';
            return (
              <span key={`${lineIndex}-${segIndex}`} className={`card-rule-text__seg card-rule-text__seg--${tone}`}>
                {t(seg.key)}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HOME_BOARD_PREMIUM_SRC } from '../../lib/brand/assets';

type JackarooBoardPreviewProps = {
  className?: string;
  /** hero = main home showcase; watermark = subtle background (optional) */
  variant?: 'hero' | 'watermark';
};

/** Home marketing board — premium photo asset only (not gameplay board). */
export function JackarooBoardPreview({
  className = '',
  variant = 'hero',
}: JackarooBoardPreviewProps) {
  const { t } = useApp();
  const [failed, setFailed] = useState(false);

  if (variant === 'watermark') {
    return (
      <div
        className={`jackaroo-board-preview jackaroo-board-preview--watermark ${className}`}
        aria-hidden
      >
        <img
          src={HOME_BOARD_PREMIUM_SRC}
          alt=""
          className="jackaroo-board-preview__image jackaroo-board-preview__image--watermark"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <figure
      className={`jackaroo-board-preview jackaroo-board-preview--hero ${className}`}
      aria-label={t('home.boardPreviewLabel')}
    >
      <div className="jackaroo-board-preview__showcase">
        {failed ? (
          <div className="jackaroo-board-preview__fallback" role="status">
            {t('home.boardPreviewUnavailable')}
          </div>
        ) : (
          <img
            src={HOME_BOARD_PREMIUM_SRC}
            alt={t('home.boardPreviewAlt')}
            className="jackaroo-board-preview__image"
            width={560}
            height={560}
            loading="eager"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </figure>
  );
}

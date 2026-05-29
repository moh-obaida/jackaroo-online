import React from 'react';
import { BoardPreviewVisual } from '../board/boardVisual';

type JackarooBoardPreviewProps = {
  className?: string;
  variant?: 'hero' | 'watermark';
};

const SEAT_COLORS = ['black', 'green', 'blue', 'white'] as const;

/** Marketing preview — same octagonal board geometry as gameplay, scaled down */
export function JackarooBoardPreview({
  className = '',
  variant = 'hero',
}: JackarooBoardPreviewProps) {
  const size = variant === 'watermark' ? 280 : 320;

  return (
    <div
      className={`jackaroo-board-preview jackaroo-board-preview--${variant} ${className}`}
      aria-hidden
    >
      {variant === 'hero' && (
        <>
          <span className="jackaroo-board-preview__card jackaroo-board-preview__card--tl" />
          <span className="jackaroo-board-preview__card jackaroo-board-preview__card--br" />
          {SEAT_COLORS.map((color) => (
            <span
              key={color}
              className={`jackaroo-board-preview__seat jackaroo-board-preview__seat--${color}`}
            />
          ))}
        </>
      )}
      <BoardPreviewVisual size={size} />
    </div>
  );
}

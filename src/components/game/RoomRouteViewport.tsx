import React from 'react';
import { JakarooIcon } from '../brand/JakarooIcon';

type RoomRouteViewportProps = {
  children: React.ReactNode;
  /** Full viewport (game shell). Marketing lobby uses padded variant. */
  variant?: 'game' | 'marketing';
};

/** Ensures room routes never render an empty dark shell while loading. */
export function RoomRouteViewport({ children, variant = 'game' }: RoomRouteViewportProps) {
  return (
    <div
      className={
        variant === 'game' ? 'room-route-viewport room-route-viewport--game' : 'room-route-viewport'
      }
    >
      {children}
    </div>
  );
}

export function RoomRouteLoadingPulse({ label }: { label?: string }) {
  return (
    <div className="room-route-loading-pulse" role="status" aria-live="polite">
      <JakarooIcon size="fallback" className="room-route-loading-pulse__icon opacity-90" />
      {label && <p className="room-route-loading-pulse__label">{label}</p>}
    </div>
  );
}

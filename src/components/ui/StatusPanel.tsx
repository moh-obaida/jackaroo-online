import React from 'react';
import { BackHomeButton, BackHomeIntent } from '../common/BackHomeButton';
import { JakarooIcon } from '../brand/JakarooIcon';

type StatusPanelProps = {
  title: string;
  message: string;
  variant?: 'info' | 'warn' | 'error';
  action?: React.ReactNode;
  showBackHome?: boolean;
  backIntent?: BackHomeIntent;
  showBrandIcon?: boolean;
};

/** Unified empty/error/loading state — always fills the viewport shell. */
export function StatusPanel({
  title,
  message,
  variant = 'info',
  action,
  showBackHome = true,
  backIntent = 'clearSession',
  showBrandIcon = true,
}: StatusPanelProps) {
  const variantClass =
    variant === 'error' ? 'status-panel--error' : variant === 'warn' ? 'status-panel--warn' : '';

  return (
    <div className="status-panel-screen">
      <div className={`status-panel jkr-panel ${variantClass}`}>
        {showBrandIcon && (
          <JakarooIcon size="fallback" className="status-panel__brand opacity-90 mx-auto mb-4" />
        )}
        <h2 className="status-panel__title">{title}</h2>
        <p className="status-panel__message">{message}</p>
        <div className="status-panel__actions">
          {action}
          {showBackHome && <BackHomeButton intent={backIntent} className="w-full max-w-xs" />}
        </div>
      </div>
    </div>
  );
}

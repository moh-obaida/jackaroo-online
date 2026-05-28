import React from 'react';
import { BackHomeButton } from '../common/BackHomeButton';

interface GameStatusCardProps {
  title: string;
  message: string;
  variant?: 'info' | 'warn' | 'error';
  action?: React.ReactNode;
  showBackHome?: boolean;
}

export function GameStatusCard({
  title,
  message,
  variant = 'info',
  action,
  showBackHome = true,
}: GameStatusCardProps) {
  const border =
    variant === 'error'
      ? 'border-red-800/50'
      : variant === 'warn'
        ? 'border-amber-700/50'
        : 'border-wood-700/50';

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className={`card-container max-w-md w-full border ${border} text-center`}>
        <h2 className="text-lg font-semibold text-gold-300 mb-2">{title}</h2>
        <p className="text-sm text-cream-200/70 mb-4">{message}</p>
        <div className="flex flex-col gap-2 items-center w-full">
          {action}
          {showBackHome && <BackHomeButton className="w-full max-w-xs" />}
        </div>
      </div>
    </div>
  );
}

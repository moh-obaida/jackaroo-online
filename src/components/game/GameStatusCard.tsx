import React from 'react';

interface GameStatusCardProps {
  title: string;
  message: string;
  variant?: 'info' | 'warn' | 'error';
  action?: React.ReactNode;
}

export function GameStatusCard({
  title,
  message,
  variant = 'info',
  action,
}: GameStatusCardProps) {
  const border =
    variant === 'error'
      ? 'border-red-800/60'
      : variant === 'warn'
        ? 'border-amber-700/60'
        : 'border-wood-700';

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className={`card-container max-w-md w-full border ${border} text-center`}>
        <h2 className="text-lg font-semibold text-gold-300 mb-2">{title}</h2>
        <p className="text-sm text-gray-300 mb-4">{message}</p>
        {action}
      </div>
    </div>
  );
}

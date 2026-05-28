import React from 'react';

type AlertVariant = 'info' | 'warn' | 'error' | 'success';

const styles: Record<AlertVariant, string> = {
  info: 'alert--info',
  warn: 'alert--warn',
  error: 'alert--error',
  success: 'alert--success',
};

export function Alert({
  variant = 'info',
  children,
  className = '',
}: {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`alert ${styles[variant]} ${className}`}>{children}</div>;
}

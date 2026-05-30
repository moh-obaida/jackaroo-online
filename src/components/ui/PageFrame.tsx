import React from 'react';

type PageFrameProps = {
  children: React.ReactNode;
  /** marketing | form | lobby */
  variant?: 'marketing' | 'form' | 'lobby';
  className?: string;
};

export function PageFrame({ children, variant = 'marketing', className = '' }: PageFrameProps) {
  const variantClass =
    variant === 'form'
      ? 'page-frame--form max-w-[27rem]'
      : variant === 'lobby'
        ? 'page-frame--lobby max-w-3xl'
        : 'page-frame--marketing max-w-5xl';

  const densityClass =
    variant === 'marketing'
      ? 'page-frame--marketing'
      : variant === 'lobby'
        ? 'page-frame--lobby'
        : 'page-frame--form';

  return (
    <div
      className={`page-frame ${variantClass} ${densityClass} mx-auto w-full px-4 py-5 md:py-6 ${className}`}
    >
      {children}
    </div>
  );
}

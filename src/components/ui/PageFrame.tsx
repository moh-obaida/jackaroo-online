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
      ? 'page-frame--form max-w-lg'
      : variant === 'lobby'
        ? 'page-frame--lobby max-w-3xl'
        : 'page-frame--marketing max-w-5xl';

  return (
    <div className={`page-frame ${variantClass} mx-auto w-full px-4 py-8 md:py-10 ${className}`}>
      {children}
    </div>
  );
}

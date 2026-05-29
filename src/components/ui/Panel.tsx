import React from 'react';

type PanelProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  glow?: boolean;
};

export function Panel({ children, title, subtitle, className = '', glow = false }: PanelProps) {
  return (
    <section className={`jkr-panel ${glow ? 'jkr-panel--glow' : ''} ${className}`}>
      {(title || subtitle) && (
        <header className="jkr-panel__header mb-5">
          {title && <h1 className="jkr-panel__title">{title}</h1>}
          {subtitle && <p className="jkr-panel__subtitle">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

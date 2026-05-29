import React, { useId, useState } from 'react';
import { useApp } from '../../context/AppContext';

const FAQ_ITEMS = [
  { q: 'pages.faq.q.guest', a: 'pages.faq.a.guest' },
  { q: 'pages.faq.q.cards', a: 'pages.faq.a.cards' },
  { q: 'pages.faq.q.arabic', a: 'pages.faq.a.arabic' },
  { q: 'pages.faq.q.custom', a: 'pages.faq.a.custom' },
  { q: 'pages.faq.q.classic', a: 'pages.faq.a.classic' },
  { q: 'pages.faq.q.password', a: 'pages.faq.a.password' },
  { q: 'pages.faq.q.mobile', a: 'pages.faq.a.mobile' },
  { q: 'pages.faq.q.bots', a: 'pages.faq.a.bots' },
] as const;

export function FaqSection() {
  const { t } = useApp();
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <div className="faq-accordion">
      {FAQ_ITEMS.map(({ q, a }, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-btn-${index}`;

        return (
          <article key={q} className={`faq-accordion__item${isOpen ? ' faq-accordion__item--open' : ''}`}>
            <h2 className="faq-accordion__heading m-0">
              <button
                id={buttonId}
                type="button"
                className="faq-accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
              >
                <span className="faq-accordion__q">{t(q)}</span>
                <span className="faq-accordion__chevron" aria-hidden="true" />
              </button>
            </h2>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="faq-accordion__panel"
              hidden={!isOpen}
            >
              <p className="faq-accordion__a">{t(a)}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

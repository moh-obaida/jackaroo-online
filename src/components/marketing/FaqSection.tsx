import React from 'react';
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

  return (
    <dl className="home-faq">
      {FAQ_ITEMS.map(({ q, a }) => (
        <div key={q} className="home-faq__item">
          <dt className="home-faq__q">{t(q)}</dt>
          <dd className="home-faq__a">{t(a)}</dd>
        </div>
      ))}
    </dl>
  );
}

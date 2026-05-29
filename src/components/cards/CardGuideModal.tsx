import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CARD_GUIDE_ORDER,
  getCardGuideActionKeys,
  getCardGuideTitleKey,
} from '../../lib/game/cardGuide';
import { CardRank } from '../../types/game';
import { CardFace } from './CardFace';

interface CardGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function CardGuideModal({ open, onClose }: CardGuideModalProps) {
  const { t, language } = useApp();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-guide-title"
      onClick={onClose}
    >
      <div
        className="modal-panel rounded-t-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-wood-700/50 shrink-0">
          <div>
            <h2 id="card-guide-title" className="text-lg font-semibold text-gold-300">
              {t('deckGuide.title')}
            </h2>
            <p className="text-xs text-cream-200/50 mt-0.5">{t('deckGuide.subtitle')}</p>
          </div>
          <button type="button" onClick={onClose} className="btn-secondary text-sm px-3 py-1.5 shrink-0">
            {t('general.close')}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3 card-guide-grid">
          <p className="text-sm text-cream-200/70 bg-surface-inset/50 rounded-lg px-3 py-2 border border-wood-800/50 m-0">
            {t('deckGuide.notice')}
          </p>

          <div className="deck-guide-disclaimer" aria-label="Disclaimer">
            <p className="deck-guide-disclaimer__line" lang="en" dir="ltr">
              {t('deckGuide.disclaimerEn')}
            </p>
            <p className="deck-guide-disclaimer__line" lang="ar" dir="rtl">
              {t('deckGuide.disclaimerAr')}
            </p>
          </div>

          {CARD_GUIDE_ORDER.map((rank) => {
            const actionKeys = getCardGuideActionKeys(rank);
            return (
              <section key={rank} className="card-guide-entry">
                <div className="playing-card-shell playing-card-shell--guide shrink-0">
                  <CardFace rank={rank} variant="guide" state="normal" />
                </div>
                <div className="card-guide-entry__copy">
                  <h3 className="card-guide-entry__title">{t(getCardGuideTitleKey(rank))}</h3>
                  <ul className="card-guide-entry__bullets">
                    {actionKeys.map((key) => (
                      <li key={key}>{t(key)}</li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}

          <p className="text-xs text-cream-200/45 text-center pb-2 m-0">{t('deckGuide.footer')}</p>
        </div>
      </div>
    </div>
  );
}

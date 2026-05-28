import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CARD_GUIDE_ORDER,
  getCardCenterValue,
  getCardGuideActionKeys,
  getCardGuideTitleKey,
} from '../../lib/game/cardGuide';
import { CardRank } from '../../types/game';
import { PlayingCard } from './PlayingCard';

interface CardGuideModalProps {
  open: boolean;
  onClose: () => void;
}

function guidePreviewCard(rank: CardRank) {
  return {
    id: `guide_${rank}`,
    rank,
    suit: 'spades' as const,
  };
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

        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-4">
          <p className="text-sm text-cream-200/70 bg-surface-inset/50 rounded-lg px-3 py-2 border border-wood-800/50">
            {t('deckGuide.notice')}
          </p>

          {CARD_GUIDE_ORDER.map((rank) => {
            const actionKeys = getCardGuideActionKeys(rank);
            return (
              <section
                key={rank}
                className="flex gap-3 sm:gap-4 items-start border-b border-wood-800/40 pb-4 last:border-0"
              >
                <div className="shrink-0 pt-1">
                  <PlayingCard card={guidePreviewCard(rank)} showHint={false} compact />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gold-300/90 mb-1">
                    {t(getCardGuideTitleKey(rank))}
                    <span className="text-cream-200/40 font-normal ms-2 tabular-nums">
                      ({getCardCenterValue(rank)})
                    </span>
                  </h3>
                  <ul className="list-disc list-inside space-y-0.5 text-xs sm:text-sm text-cream-200/75">
                    {actionKeys.map((key) => (
                      <li key={key}>{t(key)}</li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}

          <p className="text-xs text-cream-200/45 text-center pb-2">{t('deckGuide.footer')}</p>
        </div>
      </div>
    </div>
  );
}

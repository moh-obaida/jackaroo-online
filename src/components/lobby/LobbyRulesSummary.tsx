import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CardGuideModal } from '../cards/CardGuideModal';
import { Button } from '../ui/Button';

type LobbyRulesSummaryProps = {
  rulesetType: 'obaida_classic' | 'custom';
  customLabel?: string;
  compact?: boolean;
  showDeckLink?: boolean;
};

/**
 * Manus §13 — players see rules summary before readying up.
 * Obaida Classic: locked family rules + link to static deck reference (not live deck).
 */
export function LobbyRulesSummary({
  rulesetType,
  customLabel,
  compact = false,
  showDeckLink = true,
}: LobbyRulesSummaryProps) {
  const { t } = useApp();
  const [guideOpen, setGuideOpen] = useState(false);

  const isClassic = rulesetType === 'obaida_classic';

  return (
    <>
      <div className={`lobby-rules-summary ${compact ? 'lobby-rules-summary--compact' : ''}`}>
        <p className="lobby-rules-summary__badge">
          {isClassic ? t('lobby.rulesClassicBadge') : t('lobby.rulesCustomBadge')}
        </p>
        {isClassic ? (
          <ul className="lobby-rules-summary__list">
            <li>{t('lobby.rulesSummary.0')}</li>
            <li>{t('lobby.rulesSummary.1')}</li>
            <li>{t('lobby.rulesSummary.2')}</li>
          </ul>
        ) : (
          <p className="lobby-rules-summary__custom">
            {customLabel || t('create.ruleset.custom')}
          </p>
        )}
        {showDeckLink && (
          <Button variant="ghost" size="sm" onClick={() => setGuideOpen(true)} className="lobby-rules-summary__deck-link">
            {t('game.showDeck')}
          </Button>
        )}
      </div>
      {showDeckLink && <CardGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />}
    </>
  );
}

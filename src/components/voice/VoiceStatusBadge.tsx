import React from 'react';
import { useApp } from '../../context/AppContext';
import { VoiceParticipantStatus } from '../../lib/voice/types';

type VoiceStatusBadgeProps = {
  status: VoiceParticipantStatus;
  className?: string;
};

export function VoiceStatusBadge({ status, className = '' }: VoiceStatusBadgeProps) {
  const { t } = useApp();

  if (status === 'not_joined') return null;

  const label =
    status === 'speaking'
      ? t('voice.speaking')
      : status === 'muted'
        ? t('voice.muted')
        : t('voice.connected');

  const modifier =
    status === 'speaking'
      ? 'voice-status-badge--speaking'
      : status === 'muted'
        ? 'voice-status-badge--muted'
        : 'voice-status-badge--connected';

  return (
    <span
      className={`voice-status-badge ${modifier} ${className}`.trim()}
      role="status"
      aria-label={label}
    >
      <span className="voice-status-badge__dot" aria-hidden />
      <span className="voice-status-badge__text">{label}</span>
    </span>
  );
}

import React from 'react';
import { useApp } from '../../context/AppContext';
import { VoiceConnectionState } from '../../lib/voice/types';

type VoicePermissionNoticeProps = {
  connectionState: VoiceConnectionState;
  onRetry?: () => void;
  className?: string;
};

export function VoicePermissionNotice({
  connectionState,
  onRetry,
  className = '',
}: VoicePermissionNoticeProps) {
  const { t } = useApp();

  const message =
    connectionState === 'permission_denied'
      ? t('voice.permissionDenied')
      : connectionState === 'unsupported'
        ? t('voice.unsupported')
        : connectionState === 'failed'
          ? t('voice.failed')
          : null;

  if (!message) return null;

  return (
    <div className={`voice-permission-notice ${className}`.trim()} role="alert">
      <p className="voice-permission-notice__text">{message}</p>
      {onRetry && connectionState !== 'unsupported' && (
        <button
          type="button"
          className="voice-controls__btn voice-controls__btn--secondary"
          onClick={onRetry}
          aria-label={t('voice.aria.retry')}
        >
          {t('voice.retry')}
        </button>
      )}
    </div>
  );
}

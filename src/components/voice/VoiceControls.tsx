import React from 'react';
import { useApp } from '../../context/AppContext';
import { VoiceConnectionState, isVoiceActiveState } from '../../lib/voice/types';
import { VoicePermissionNotice } from './VoicePermissionNotice';

export type VoiceControlsProps = {
  connectionState: VoiceConnectionState;
  isSupported: boolean;
  compact?: boolean;
  /** In-game HUD: show coming-soon chip instead of prominent Join Voice. */
  demoteInGame?: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onMute: () => void;
  onUnmute: () => void;
  onRetry: () => void;
  className?: string;
};

export function VoiceControls({
  connectionState,
  isSupported,
  compact = false,
  demoteInGame = false,
  onJoin,
  onLeave,
  onMute,
  onUnmute,
  onRetry,
  className = '',
}: VoiceControlsProps) {
  const { t } = useApp();

  const showPermission =
    connectionState === 'permission_denied' ||
    connectionState === 'unsupported' ||
    connectionState === 'failed';

  const statusLabel =
    connectionState === 'joining'
      ? t('voice.joining')
      : connectionState === 'connected'
        ? t('voice.connected')
        : connectionState === 'muted'
          ? t('voice.muted')
          : connectionState === 'idle'
            ? t('voice.idle')
            : null;

  const rootClass = [
    'voice-controls',
    'game-control-cluster',
    compact ? 'voice-controls--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={rootClass}
      aria-label={t('voice.aria.panel')}
      data-voice-state={connectionState}
    >
      <div className="voice-controls__row">
        {connectionState === 'idle' && demoteInGame && (
          <span className="voice-controls__soon" title={t('voice.comingSoonHint')}>
            {t('voice.comingSoon')}
          </span>
        )}
        {connectionState === 'idle' && !demoteInGame && (
          <button
            type="button"
            className="voice-controls__btn voice-controls__btn--primary"
            onClick={onJoin}
            disabled={!isSupported}
            aria-label={t('voice.aria.join')}
          >
            {t('voice.join')}
          </button>
        )}

        {connectionState === 'joining' && (
          <button
            type="button"
            className="voice-controls__btn voice-controls__btn--primary"
            disabled
            aria-busy="true"
            aria-label={t('voice.aria.joining')}
          >
            {t('voice.joining')}
          </button>
        )}

        {isVoiceActiveState(connectionState) && (
          <>
            {connectionState === 'muted' ? (
              <button
                type="button"
                className="voice-controls__btn voice-controls__btn--secondary"
                onClick={onUnmute}
                aria-label={t('voice.aria.unmute')}
              >
                {t('voice.unmute')}
              </button>
            ) : (
              <button
                type="button"
                className="voice-controls__btn voice-controls__btn--secondary"
                onClick={onMute}
                aria-label={t('voice.aria.mute')}
              >
                {t('voice.mute')}
              </button>
            )}
            <button
              type="button"
              className="voice-controls__btn voice-controls__btn--danger"
              onClick={onLeave}
              aria-label={t('voice.aria.leave')}
            >
              {t('voice.leave')}
            </button>
          </>
        )}

        {showPermission && (
          <button
            type="button"
            className="voice-controls__btn voice-controls__btn--primary"
            onClick={onRetry}
            disabled={connectionState === 'unsupported'}
            aria-label={t('voice.aria.retry')}
          >
            {t('voice.retry')}
          </button>
        )}
      </div>

      {statusLabel && connectionState !== 'idle' && !showPermission && (
        <p className="voice-controls__status" role="status" aria-live="polite">
          {statusLabel}
        </p>
      )}

      {showPermission && (
        <VoicePermissionNotice
          connectionState={connectionState}
          onRetry={connectionState !== 'unsupported' ? onRetry : undefined}
        />
      )}

      {!compact && connectionState === 'idle' && (
        <p className="voice-controls__privacy">{t('voice.privacy')}</p>
      )}
      {compact && connectionState === 'idle' && (
        <p className="voice-controls__privacy voice-controls__privacy--compact">{t('voice.privacy')}</p>
      )}
    </section>
  );
}

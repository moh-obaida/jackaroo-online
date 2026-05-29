import React from 'react';
import { useApp } from '../../context/AppContext';
import { RoomRouteState } from '../../lib/room/routeState';
import { translateSessionMessage } from '../../lib/i18n/translateSessionMessage';
import { StatusPanel } from '../ui/StatusPanel';
import { BackHomeButton } from '../common/BackHomeButton';
import { Button } from '../ui/Button';

type RoomRouteFallbackProps = {
  state: RoomRouteState;
  roomCode?: string | null;
  onReload?: () => void;
};

export function RoomRouteFallback({ state, roomCode, onReload }: RoomRouteFallbackProps) {
  const { t } = useApp();

  const reloadAction = onReload ? (
    <Button variant="primary" fullWidth onClick={onReload}>
      {t('game.reload')}
    </Button>
  ) : null;

  switch (state.kind) {
    case 'loading_session':
      return (
        <StatusPanel
          title={t('game.loadingSession')}
          message={t('game.loadingSessionMessage')}
        />
      );
    case 'firebase_missing':
      return (
        <StatusPanel
          title={t('game.firebaseMissing')}
          message={t('game.firebaseMissingMessage')}
          variant="error"
          action={<BackHomeButton intent="navigate" />}
          showBackHome={false}
        />
      );
    case 'sign_in_required':
      return (
        <StatusPanel
          title={t('game.signInRequired')}
          message={t('game.signInRequiredMessage')}
          action={<BackHomeButton intent="navigate" />}
          showBackHome={false}
        />
      );
    case 'invalid_code':
      return (
        <StatusPanel
          title={t('game.invalidLink')}
          message={t('game.invalidLinkMessage')}
          variant="warn"
          action={<BackHomeButton intent="navigate" />}
          showBackHome={false}
        />
      );
    case 'leaving':
      return (
        <StatusPanel
          title={t('game.leaving')}
          message={t('game.leavingMessage')}
          showBackHome={false}
        />
      );
    case 'loading_room':
      return (
        <StatusPanel
          title={t('game.loadingRoom')}
          message={
            roomCode
              ? t('game.loadingRoomMessage', { code: roomCode })
              : t('general.loading')
          }
        />
      );
    case 'room_not_found':
      return (
        <StatusPanel
          title={t('game.roomNotFound')}
          message={t('game.roomNotFoundMessage', { code: roomCode || '—' })}
          variant="warn"
          action={<BackHomeButton intent="clearSession" />}
          showBackHome={false}
        />
      );
    case 'room_expired':
      return (
        <StatusPanel
          title={t('game.roomExpired')}
          message={t('game.roomExpiredMessage', { code: roomCode || '—' })}
          variant="warn"
          action={<BackHomeButton intent="clearSession" />}
          showBackHome={false}
        />
      );
    case 'left_room':
    case 'not_member':
      return (
        <StatusPanel
          title={t('game.notInRoom')}
          message={t('game.notInRoomMessage')}
          variant="warn"
          action={<BackHomeButton intent="clearSession" />}
          showBackHome={false}
        />
      );
    case 'redirect_to_game':
      return (
        <StatusPanel
          title={t('lobby.redirectingToGame')}
          message={
            roomCode
              ? t('game.loadingRoomMessage', { code: roomCode })
              : t('general.loading')
          }
        />
      );
    case 'game_not_started':
      return (
        <StatusPanel
          title={t('game.notStarted')}
          message={t('game.notStartedMessage')}
          action={<BackHomeButton intent="clearSession" />}
          showBackHome={false}
        />
      );
    case 'waiting_game_state':
      return (
        <StatusPanel
          title={t('game.waitingState')}
          message={t('game.waitingStateMessage')}
          action={
            <div className="flex flex-col gap-2 w-full">
              {reloadAction}
              <BackHomeButton intent="clearSession" className="w-full" />
            </div>
          }
          showBackHome={false}
        />
      );
    case 'loading_hand':
      return (
        <StatusPanel
          title={t('game.loadingHand')}
          message={t('game.loadingHandMessage')}
        />
      );
    case 'hand_error':
      return (
        <StatusPanel
          title={t('game.handError')}
          message={translateSessionMessage(t, state.message)}
          variant="error"
          action={
            <div className="flex flex-col gap-2 w-full">
              {reloadAction}
              <BackHomeButton intent="clearSession" className="w-full" />
            </div>
          }
          showBackHome={false}
        />
      );
    default:
      return (
        <StatusPanel
          title={t('game.waitingState')}
          message={t('game.waitingStateMessage')}
          action={<BackHomeButton intent="clearSession" />}
          showBackHome={false}
        />
      );
  }
}

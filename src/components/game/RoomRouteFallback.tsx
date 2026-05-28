import React from 'react';
import { useApp } from '../../context/AppContext';
import { RoomRouteState } from '../../lib/room/routeState';
import { GameStatusCard } from './GameStatusCard';
import { BackHomeButton } from '../common/BackHomeButton';

type RoomRouteFallbackProps = {
  state: RoomRouteState;
  roomCode?: string | null;
  onReload?: () => void;
};

export function RoomRouteFallback({ state, roomCode, onReload }: RoomRouteFallbackProps) {
  const { t } = useApp();

  const reloadAction = onReload ? (
    <button type="button" className="btn-primary w-full" onClick={onReload}>
      {t('game.reload')}
    </button>
  ) : null;

  switch (state.kind) {
    case 'loading_session':
      return (
        <GameStatusCard
          title={t('game.loadingSession')}
          message={t('game.loadingSessionMessage')}
        />
      );
    case 'firebase_missing':
      return (
        <GameStatusCard
          title={t('game.firebaseMissing')}
          message={t('game.firebaseMissingMessage')}
          variant="error"
          action={<BackHomeButton intent="navigate" />}
          showBackHome={false}
        />
      );
    case 'sign_in_required':
      return (
        <GameStatusCard
          title={t('game.signInRequired')}
          message={t('game.signInRequiredMessage')}
          action={<BackHomeButton intent="navigate" />}
          showBackHome={false}
        />
      );
    case 'invalid_code':
      return (
        <GameStatusCard
          title={t('game.invalidLink')}
          message={t('game.invalidLinkMessage')}
          action={<BackHomeButton intent="navigate" />}
          showBackHome={false}
        />
      );
    case 'leaving':
      return (
        <GameStatusCard
          title={t('game.leaving')}
          message={t('game.leavingMessage')}
          showBackHome={false}
        />
      );
    case 'loading_room':
      return (
        <GameStatusCard
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
        <GameStatusCard
          title={t('game.roomNotFound')}
          message={t('game.roomNotFoundMessage', { code: roomCode || '—' })}
          variant="warn"
          action={<BackHomeButton intent="clearSession" />}
          showBackHome={false}
        />
      );
    case 'left_room':
      return (
        <GameStatusCard
          title={t('game.notInRoom')}
          message={t('game.notInRoomMessage')}
          variant="warn"
          action={<BackHomeButton intent="clearSession" />}
          showBackHome={false}
        />
      );
    case 'not_member':
      return (
        <GameStatusCard
          title={t('game.notInRoom')}
          message={t('game.notInRoomMessage')}
          variant="warn"
          action={<BackHomeButton intent="clearSession" />}
          showBackHome={false}
        />
      );
    case 'redirect_to_game':
      return (
        <GameStatusCard
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
        <GameStatusCard
          title={t('game.notStarted')}
          message={t('game.notStartedMessage')}
          action={<BackHomeButton intent="clearSession" />}
          showBackHome={false}
        />
      );
    case 'waiting_game_state':
      return (
        <GameStatusCard
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
        <GameStatusCard
          title={t('game.loadingHand')}
          message={t('game.loadingHandMessage')}
        />
      );
    case 'hand_error':
      return (
        <GameStatusCard
          title={t('game.handError')}
          message={state.message}
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
        <GameStatusCard
          title={t('game.waitingState')}
          message={t('game.waitingStateMessage')}
          action={<BackHomeButton intent="clearSession" />}
          showBackHome={false}
        />
      );
  }
}

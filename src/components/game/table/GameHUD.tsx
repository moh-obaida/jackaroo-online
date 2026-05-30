import React, { useState } from 'react';
import { GameState } from '../../../types/game';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../ui/Button';
import { JakarooIcon } from '../../brand/JakarooIcon';
import { JakarooWordmark } from '../../brand/JakarooWordmark';
import { ConnectionBar } from '../../ui/ConnectionBar';
import { formatPlayerName, formatTableCode } from '../../../lib/player/displayName';
import { PlayerColor } from '../../../types/game';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

type GameHUDProps = {
  roomCode: string;
  gameState: GameState;
  isMyTurn: boolean;
  turnPlayerName: string;
  onLeave: () => void;
  leaveBusy: boolean;
  myColor?: PlayerColor | null;
};

export function GameHUD({
  roomCode,
  gameState,
  isMyTurn,
  turnPlayerName,
  onLeave,
  leaveBusy,
  myColor,
}: GameHUDProps) {
  const { t } = useApp();
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const displayTurnName = formatPlayerName(turnPlayerName);

  return (
    <>
      <header className="game-table-hud">
        <div className="game-table-hud__brand-row min-w-0 flex items-center gap-2">
          <JakarooIcon size="md" className="opacity-95 shrink-0 game-table-hud__icon" alt="" />
          <JakarooWordmark variant="header" decorative className="game-table-hud__wordmark hidden sm:inline" />
          <div className="game-table-hud__meta min-w-0">
            <p className="game-table-hud__code-line tabular-nums truncate">
              <span className="font-brand">{formatTableCode(roomCode)}</span>
              <span className="game-table-hud__code-sep" aria-hidden="true">·</span>
              {t('game.dealRound')} {gameState.dealState.dealRoundInBlock + 1}
            </p>
          </div>
        </div>

        <div className="game-table-hud__center min-w-0 flex flex-col items-center gap-1">
          <ConnectionBar variant="game" />
          <div
            className={`game-table-hud__turn ${isMyTurn ? 'game-table-hud__turn--yours' : ''}`}
            role="status"
            aria-live="polite"
          >
            {isMyTurn ? (
              <p className="text-sm font-bold text-gold-300 turn-pulse">{t('game.yourTurn')}</p>
            ) : (
              <p className="text-xs text-cream-200/70 truncate" title={displayTurnName}>
                {t('game.turnChoosing', { name: displayTurnName })}
              </p>
            )}
          </div>
        </div>

        <div className="game-table-hud__actions">
          {myColor && (
            <span
              className={`game-table-hud__color-chip game-table-hud__color-chip--${myColor}`}
              title={t(`game.color.${myColor}`)}
            >
              {t('game.youAreColor', { color: t(`game.color.${myColor}`) })}
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setLeaveConfirmOpen(true)}
            disabled={leaveBusy}
            className="game-table-hud__leave shrink-0 text-xs"
          >
            {t('game.leaveGame')}
          </Button>
        </div>
      </header>
      <ConfirmDialog
        open={leaveConfirmOpen}
        title={t('game.leaveConfirmTitle')}
        message={t('game.leaveConfirmMessage')}
        confirmLabel={t('game.leaveGame')}
        cancelLabel={t('game.cancel')}
        variant="danger"
        busy={leaveBusy}
        onCancel={() => setLeaveConfirmOpen(false)}
        onConfirm={() => {
          setLeaveConfirmOpen(false);
          onLeave();
        }}
      />
    </>
  );
}

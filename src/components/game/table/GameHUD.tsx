import React, { useState } from 'react';
import { GameState } from '../../../types/game';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../ui/Button';
import { JakarooIcon } from '../../brand/JakarooIcon';
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
          <JakarooIcon size="sm" className="opacity-90" alt="" />
          <div className="game-table-hud__meta min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-cream-200/45 tabular-nums truncate">
              {formatTableCode(roomCode)} · {t('game.dealRound')} {gameState.dealState.dealRoundInBlock + 1}
            </p>
          </div>
        </div>
        <div
          className={`game-table-hud__turn ${isMyTurn ? 'game-table-hud__turn--yours' : ''}`}
          role="status"
          aria-live="polite"
        >
          {isMyTurn ? (
            <p className="text-sm font-bold text-gold-300 turn-pulse">{t('game.yourTurn')}</p>
          ) : (
            <p className="text-xs text-cream-200/70 truncate">
              {t('game.turnChoosing', { name: displayTurnName })}
            </p>
          )}
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
            variant="danger"
            size="sm"
            onClick={() => setLeaveConfirmOpen(true)}
            disabled={leaveBusy}
            className="shrink-0"
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

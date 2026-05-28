import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GameState } from '../../types/game';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';

interface WinOverlayProps {
  gameState: GameState;
}

export function WinOverlay({ gameState }: WinOverlayProps) {
  const { t } = useApp();
  const navigate = useNavigate();

  if (!gameState.winner) return null;

  const winnerNames = gameState.winner.winnerPlayerIds
    .map((id) => gameState.players.find((p) => p.id === id)?.name || 'Unknown')
    .join(', ');

  return (
    <div className="win-overlay-v2" role="dialog" aria-modal="true">
      <Panel glow className="text-center max-w-md mx-4">
        <div className="text-4xl mb-4" aria-hidden>
          🏆
        </div>
        <h2 className="text-2xl font-bold text-gold-400 mb-2">{t('game.winner')}</h2>
        <p className="text-lg text-cream-100 mb-1">
          {gameState.winner.winnerTeam
            ? t('game.teamWins', { team: gameState.winner.winnerTeam })
            : t('game.playerWins', { player: winnerNames })}
        </p>
        <p className="text-sm text-cream-200/50 mb-6">{winnerNames}</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          {t('game.backToLobby')}
        </Button>
      </Panel>
    </div>
  );
}

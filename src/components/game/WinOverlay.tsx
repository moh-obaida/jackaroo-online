import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GameState } from '../../types/game';
import { useApp } from '../../context/AppContext';

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="card-container text-center max-w-md mx-4">
        <div className="text-4xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-gold-400 mb-2">
          {t('game.winner')}
        </h2>
        <p className="text-lg text-white mb-1">
          {gameState.winner.winnerTeam
            ? t('game.teamWins', { team: gameState.winner.winnerTeam })
            : t('game.playerWins', { player: winnerNames })}
        </p>
        <p className="text-sm text-gray-400 mb-6">{winnerNames}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            {t('game.backToLobby')}
          </button>
        </div>
      </div>
    </div>
  );
}

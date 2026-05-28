import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { GameBoard } from '../components/board/GameBoard';
import { PlayerHand } from '../components/cards/PlayerHand';
import { ActionPanel } from '../components/game/ActionPanel';
import { EventLog } from '../components/game/EventLog';
import { WinOverlay } from '../components/game/WinOverlay';
import { subscribeToGameState, subscribeToPrivateHand } from '../lib/firebase/rooms';
import { GameState, Card } from '../types/game';

export function GamePage() {
  const { t, user } = useApp();
  const { room, gameState, myHand, legalActions, isMyTurn, myPlayer, setRoomCode, submitAction } = useGame();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [localGameState, setLocalGameState] = useState<GameState | null>(null);
  const [localHand, setLocalHand] = useState<Card[]>([]);

  useEffect(() => {
    if (code) {
      setRoomCode(code);
    }
  }, [code, setRoomCode]);

  useEffect(() => {
    if (!code) return;
    const unsub = subscribeToGameState(code, (state) => {
      if (state) setLocalGameState(state);
    });
    return unsub;
  }, [code]);

  useEffect(() => {
    if (!code || !user?.uid) return;
    const unsub = subscribeToPrivateHand(code, user.uid, (cards) => {
      setLocalHand(cards || []);
    });
    return unsub;
  }, [code, user?.uid]);

  const currentGameState = gameState || localGameState;
  const currentHand = myHand.length > 0 ? myHand : localHand;
  const playerId = user?.uid;

  const currentIsMyTurn = currentGameState?.currentTurnPlayerId === playerId;
  const currentPlayer = currentGameState?.players.find(
    (p) => p.id === currentGameState.currentTurnPlayerId
  );

  if (!currentGameState) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">{t('general.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
      {/* Win Overlay */}
      {currentGameState.winner && (
        <WinOverlay gameState={currentGameState} />
      )}

      {/* Main Board Area */}
      <div className="flex-1 flex flex-col items-center">
        {/* Turn Indicator */}
        <div className="mb-4 text-center">
          {currentIsMyTurn ? (
            <div className="text-lg font-bold text-gold-400 animate-pulse">
              {t('game.yourTurn')}
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              {t('game.waiting')} {currentPlayer?.name}...
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {t('game.dealRound')} {currentGameState.dealState.dealRoundInBlock + 1}
          </div>
        </div>

        {/* Board */}
        <GameBoard
          gameState={currentGameState}
          selectedCardId={selectedCardId}
          playerId={playerId || ''}
        />
      </div>

      {/* Side Panel */}
      <div className="lg:w-80 flex flex-col gap-4">
        {/* Hand */}
        <div className="card-container">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">{t('game.hand')}</h3>
          <PlayerHand
            cards={currentHand}
            selectedCardId={selectedCardId}
            onSelectCard={setSelectedCardId}
            disabled={!currentIsMyTurn}
          />
        </div>

        {/* Action Panel */}
        {currentIsMyTurn && (
          <ActionPanel
            legalActions={legalActions}
            selectedCardId={selectedCardId}
            onSubmitAction={submitAction}
            playerId={playerId || ''}
          />
        )}

        {/* Event Log */}
        <EventLog events={currentGameState.eventLog} />
      </div>
    </div>
  );
}

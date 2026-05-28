import React from 'react';
import { GameState } from '../../../types/game';
import { OpponentStrip } from '../OpponentStrip';
import { VoiceParticipantStatus } from '../../../lib/voice/types';

type OpponentSeatsProps = {
  gameState: GameState;
  myPlayerId: string;
  getVoiceStatus?: (playerId: string) => VoiceParticipantStatus;
};

export function OpponentSeats({ gameState, myPlayerId, getVoiceStatus }: OpponentSeatsProps) {
  return (
    <div className="opponent-seats-grid w-full h-full min-h-0 grid grid-rows-[auto_1fr_auto] grid-cols-[minmax(0,4rem)_1fr_minmax(0,4rem)] sm:grid-cols-[5rem_1fr_5rem] gap-1 items-center">
      <div className="col-span-3 flex justify-center items-center min-h-[2.75rem]">
        <OpponentStrip
          gameState={gameState}
          myPlayerId={myPlayerId}
          slot="top"
          getVoiceStatus={getVoiceStatus}
        />
      </div>
      <div className="hidden sm:flex justify-center items-center">
        <OpponentStrip
          gameState={gameState}
          myPlayerId={myPlayerId}
          slot="left"
          getVoiceStatus={getVoiceStatus}
        />
      </div>
      <div className="col-start-2 row-start-2 min-h-0 min-w-0" />
      <div className="hidden sm:flex justify-center items-center">
        <OpponentStrip
          gameState={gameState}
          myPlayerId={myPlayerId}
          slot="right"
          getVoiceStatus={getVoiceStatus}
        />
      </div>
    </div>
  );
}

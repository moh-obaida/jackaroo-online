import { useCallback, useEffect, useRef, useState } from 'react';
import {
  VoiceConnectionState,
  VoiceParticipant,
  VoiceParticipantsMap,
  voiceParticipantStatus,
} from '../lib/voice/types';

const MOCK_JOIN_MS = 450;

export type UseVoiceChatResult = {
  connectionState: VoiceConnectionState;
  participants: VoiceParticipantsMap;
  isSupported: boolean;
  joinVoice: () => void;
  leaveVoice: () => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  retryJoin: () => void;
  getParticipantStatus: (playerId: string | null | undefined) => ReturnType<
    typeof voiceParticipantStatus
  >;
};

function idleParticipants(): VoiceParticipantsMap {
  return {};
}

/**
 * V1 mock voice — local state only. No getUserMedia, signaling, or backend.
 */
export function useVoiceChat(
  roomCode: string | null,
  localPlayerId: string | null
): UseVoiceChatResult {
  const [connectionState, setConnectionState] = useState<VoiceConnectionState>('idle');
  const [participants, setParticipants] = useState<VoiceParticipantsMap>(idleParticipants);
  const joinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearJoinTimer = useCallback(() => {
    if (joinTimerRef.current !== null) {
      clearTimeout(joinTimerRef.current);
      joinTimerRef.current = null;
    }
  }, []);

  const resetToIdle = useCallback(() => {
    clearJoinTimer();
    setConnectionState('idle');
    setParticipants(idleParticipants());
  }, [clearJoinTimer]);

  const leaveVoice = useCallback(() => {
    resetToIdle();
  }, [resetToIdle]);

  useEffect(() => {
    if (!roomCode) {
      leaveVoice();
    }
  }, [roomCode, leaveVoice]);

  useEffect(() => {
    return () => {
      clearJoinTimer();
      setConnectionState('idle');
      setParticipants(idleParticipants());
    };
  }, [clearJoinTimer]);

  const syncLocalParticipant = useCallback(
    (status: VoiceParticipant['status']) => {
      if (!localPlayerId) return;
      setParticipants((prev) => ({
        ...prev,
        [localPlayerId]: { playerId: localPlayerId, status },
      }));
    },
    [localPlayerId]
  );

  const joinVoice = useCallback(() => {
    if (connectionState === 'joining') return;
    if (connectionState === 'connected' || connectionState === 'muted') return;

    clearJoinTimer();
    setConnectionState('joining');

    joinTimerRef.current = setTimeout(() => {
      joinTimerRef.current = null;
      setConnectionState('connected');
      syncLocalParticipant('connected');
    }, MOCK_JOIN_MS);
  }, [connectionState, clearJoinTimer, syncLocalParticipant]);

  const mute = useCallback(() => {
    if (connectionState !== 'connected') return;
    setConnectionState('muted');
    syncLocalParticipant('muted');
  }, [connectionState, syncLocalParticipant]);

  const unmute = useCallback(() => {
    if (connectionState !== 'muted') return;
    setConnectionState('connected');
    syncLocalParticipant('connected');
  }, [connectionState, syncLocalParticipant]);

  const toggleMute = useCallback(() => {
    if (connectionState === 'muted') unmute();
    else if (connectionState === 'connected') mute();
  }, [connectionState, mute, unmute]);

  const retryJoin = useCallback(() => {
    if (
      connectionState !== 'failed' &&
      connectionState !== 'permission_denied' &&
      connectionState !== 'unsupported'
    ) {
      return;
    }
    joinVoice();
  }, [connectionState, joinVoice]);

  const getParticipantStatus = useCallback(
    (playerId: string | null | undefined) => voiceParticipantStatus(participants, playerId),
    [participants]
  );

  return {
    connectionState,
    participants,
    isSupported: true,
    joinVoice,
    leaveVoice,
    mute,
    unmute,
    toggleMute,
    retryJoin,
    getParticipantStatus,
  };
}

/** Optional explicit cleanup when parent holds voice state outside useVoiceChat. */
export function useVoiceChatCleanup(roomCode: string | null, leaveVoice: () => void): void {
  useEffect(() => {
    if (!roomCode) leaveVoice();
  }, [roomCode, leaveVoice]);

  useEffect(() => () => leaveVoice(), [leaveVoice]);
}

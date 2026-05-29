/** Local voice session state (V1 mock — no WebRTC). */
export type VoiceConnectionState =
  | 'idle'
  | 'joining'
  | 'connected'
  | 'muted'
  | 'failed'
  | 'permission_denied'
  | 'unsupported';

/** Per-seat badge shown on lobby/table seats. */
export type VoiceParticipantStatus = 'not_joined' | 'connected' | 'muted' | 'speaking';

export type VoiceParticipant = {
  playerId: string;
  status: VoiceParticipantStatus;
};

export type VoiceParticipantsMap = Record<string, VoiceParticipant>;

export function voiceParticipantStatus(
  map: VoiceParticipantsMap,
  playerId: string | null | undefined
): VoiceParticipantStatus {
  if (!playerId) return 'not_joined';
  return map[playerId]?.status ?? 'not_joined';
}

export function isVoiceActiveState(state: VoiceConnectionState): boolean {
  return state === 'connected' || state === 'muted';
}

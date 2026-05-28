import { leaveRoom } from '../firebase/rooms';

export type SafeLeaveParams = {
  roomCode: string;
  playerUid: string;
};

/**
 * Remove player from Firebase. Caller must already have cleared local session
 * and navigated home if the UI should not wait on network.
 */
export async function removePlayerFromRoom({ roomCode, playerUid }: SafeLeaveParams): Promise<void> {
  if (!roomCode?.trim() || !playerUid?.trim()) return;
  await leaveRoom(roomCode.trim(), playerUid.trim());
}

export function leaveWarningMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return 'Left locally; server sync may be delayed.';
}

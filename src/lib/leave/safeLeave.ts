import { leaveRoom } from '../firebase/rooms';

export type SafeLeaveParams = {
  roomCode: string;
  playerUid: string;
};

const LEAVE_TIMEOUT_MS = 8000;

/**
 * Remove player from Firebase (with timeout). Call after navigation so UI never blocks.
 */
export async function removePlayerFromRoom({ roomCode, playerUid }: SafeLeaveParams): Promise<void> {
  if (!roomCode?.trim() || !playerUid?.trim()) return;

  const removePromise = leaveRoom(roomCode.trim(), playerUid.trim());
  const timeoutPromise = new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error('Leave timed out')), LEAVE_TIMEOUT_MS);
  });

  await Promise.race([removePromise, timeoutPromise]);
}

export function leaveWarningMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return 'Left locally; server sync may be delayed.';
}

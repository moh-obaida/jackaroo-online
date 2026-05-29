import { RoomData } from '../../types/game';

const LOBBY_INACTIVITY_MS = 10 * 60 * 1000;

/** Lobby room past inactivity window or explicitly marked expired. */
export function isRoomExpired(room: RoomData): boolean {
  if (room.status === 'expired') return true;
  if (room.status !== 'lobby') return false;
  const lastActivity = room.updatedAt || room.createdAt || 0;
  if (lastActivity > 0 && Date.now() > lastActivity + LOBBY_INACTIVITY_MS) {
    return true;
  }
  return typeof room.expiresAt === 'number' && room.expiresAt > 0 && Date.now() > room.expiresAt;
}

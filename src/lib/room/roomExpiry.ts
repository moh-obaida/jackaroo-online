import { RoomData } from '../../types/game';

/** Lobby room past inactivity window or explicitly marked expired. */
export function isRoomExpired(room: RoomData): boolean {
  if (room.status === 'expired') return true;
  if (room.status !== 'lobby') return false;
  return typeof room.expiresAt === 'number' && room.expiresAt > 0 && Date.now() > room.expiresAt;
}

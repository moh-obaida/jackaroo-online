const LEFT_PREFIX = 'jakaroo_left_';
const ACTIVE_ROOM_KEY = 'jakaroo_active_room';

function leftKey(roomCode: string): string {
  return `${LEFT_PREFIX}${roomCode.trim()}`;
}

/** Record that the user intentionally left this room (blocks silent rejoin on refresh). */
export function markLeft(roomCode: string): void {
  const code = roomCode?.trim();
  if (!code) return;
  try {
    sessionStorage.setItem(leftKey(code), String(Date.now()));
  } catch {
    /* ignore quota / private mode */
  }
}

export function hasLeft(roomCode: string): boolean {
  const code = roomCode?.trim();
  if (!code) return false;
  try {
    return sessionStorage.getItem(leftKey(code)) != null;
  } catch {
    return false;
  }
}

export function clearLeftMark(roomCode: string): void {
  const code = roomCode?.trim();
  if (!code) return;
  try {
    sessionStorage.removeItem(leftKey(code));
  } catch {
    /* ignore */
  }
}

export function setActiveRoomCode(roomCode: string | null): void {
  try {
    if (!roomCode?.trim()) {
      sessionStorage.removeItem(ACTIVE_ROOM_KEY);
      return;
    }
    sessionStorage.setItem(ACTIVE_ROOM_KEY, roomCode.trim());
  } catch {
    /* ignore */
  }
}

export function getActiveRoomCode(): string | null {
  try {
    const v = sessionStorage.getItem(ACTIVE_ROOM_KEY);
    return v?.trim() || null;
  } catch {
    return null;
  }
}

/** Session-only copy of room password for the host (RTDB stores hash only). */
const HOST_PASSWORD_PREFIX = 'jakaroo_host_pwd_';

function passwordKey(roomCode: string): string {
  return `${HOST_PASSWORD_PREFIX}${roomCode.trim()}`;
}

export function saveHostRoomPassword(roomCode: string, password: string): void {
  const code = roomCode?.trim();
  const value = password?.trim();
  if (!code || !value) return;
  try {
    sessionStorage.setItem(passwordKey(code), value);
  } catch {
    /* ignore quota / private mode */
  }
}

export function getHostRoomPassword(roomCode: string): string | null {
  const code = roomCode?.trim();
  if (!code) return null;
  try {
    const v = sessionStorage.getItem(passwordKey(code));
    return v?.trim() || null;
  } catch {
    return null;
  }
}

export function clearHostRoomPassword(roomCode: string): void {
  const code = roomCode?.trim();
  if (!code) return;
  try {
    sessionStorage.removeItem(passwordKey(code));
  } catch {
    /* ignore */
  }
}

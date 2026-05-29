/** Translate lobby/game/join error keys; pass through raw messages otherwise. */
export function translateSessionMessage(t: (key: string) => string, message: string): string {
  if (/^(lobby|game|join)\.[a-zA-Z0-9_.]+$/.test(message)) {
    const translated = t(message);
    if (translated !== message) return translated;
  }
  return message;
}

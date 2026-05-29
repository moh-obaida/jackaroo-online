const MIN_LEN = 2;
const MAX_LEN = 20;

export type DisplayNameResult =
  | { ok: true; value: string }
  | { ok: false; errorKey: 'player.nameTooShort' | 'player.nameTooLong' | 'player.nameInvalid' };

/** Trim, collapse internal whitespace, validate length for create/join. */
export function normalizeDisplayNameInput(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function validateDisplayName(raw: string): DisplayNameResult {
  const value = normalizeDisplayNameInput(raw);
  if (!value || !/\S/.test(value)) {
    return { ok: false, errorKey: 'player.nameInvalid' };
  }
  if (value.length < MIN_LEN) {
    return { ok: false, errorKey: 'player.nameTooShort' };
  }
  if (value.length > MAX_LEN) {
    return { ok: false, errorKey: 'player.nameTooLong' };
  }
  return { ok: true, value };
}

/** Player-facing label with ellipsis for tight UI (seats, HUD, activity). */
export function formatPlayerName(name: string | null | undefined, maxLen = 14): string {
  const trimmed = normalizeDisplayNameInput(name ?? '');
  if (!trimmed) return '—';
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1)}…`;
}

/** Table code label: "Table 280549" */
export function formatTableCode(code: string | null | undefined): string {
  const c = code?.trim();
  return c ? `Table ${c}` : 'Table';
}

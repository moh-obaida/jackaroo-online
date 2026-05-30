// ============================================================================
// ROOMS MODULE — Firebase room CRUD and real-time sync
// All randomness (room code, deck, etc.) generated ONCE and saved here.
// Handles missing Firebase config gracefully.
// ============================================================================

import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  runTransaction,
  DataSnapshot,
} from 'firebase/database';
import { database, isFirebaseConfigured } from './config';
import {
  RoomData,
  PlayerState,
  GameMode,
  RulesetType,
  BotSettings,
  CustomRulesConfig,
  COLORS_ORDER,
  TEAM_ASSIGNMENTS,
  GameState,
  Card,
} from '../../types/game';
import { normalizeCards, normalizeGameState } from '../game/normalize';
import { canCommitMoveTransaction } from '../game/compareAndSet';
import { getNextTurnPlayerAfterLeave } from '../game/turns';
import { isRoomExpired } from '../room/roomExpiry';
import { colorForSeat, getNextJoinSeat, getSeatSlotsForMode } from '../game/seats';

// ============================================================================
// ROOM CODE GENERATION — Numeric only, saved to Firebase
// ============================================================================

/**
 * Generate a random 6-digit numeric room code.
 */
export function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Simple hash for room password (client-side).
 * Not cryptographically strong — documented as first-version approach.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'jakaroo_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against its hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

// ============================================================================
// ROOM CRUD
// ============================================================================

/**
 * Create a new room. Room code is generated once and saved.
 */
export async function createRoom(params: {
  roomMakerUid: string;
  roomMakerName: string;
  roomMakerGuest: boolean;
  password: string;
  mode: GameMode;
  rulesetType: RulesetType;
  rulesetId: string;
  customRulesSummary: CustomRulesConfig | null;
  botSettings: BotSettings;
  language: 'en' | 'ar';
  theme: 'dark' | 'light' | 'balanced';
}): Promise<string> {
  if (!database) throw new Error('Firebase not configured');

  // Generate room code, check for collision
  let code = generateRoomCode();
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    const roomRef = ref(database, `rooms/${code}`);
    const snapshot = await get(roomRef);
    exists = snapshot.exists();
    if (exists) {
      code = generateRoomCode();
      attempts++;
    }
  }

  const passwordHash = await hashPassword(params.password);
  const now = Date.now();

  // Assign first color/seat to room maker
  const roomMakerColor = COLORS_ORDER[0];
  const roomMakerSeat = 0;
  const roomMakerTeam = params.mode === '4p_teams' ? TEAM_ASSIGNMENTS[0] : null;

  const roomMakerPlayer: PlayerState = {
    id: params.roomMakerUid,
    uid: params.roomMakerUid,
    name: params.roomMakerName,
    color: roomMakerColor,
    seat: roomMakerSeat,
    team: roomMakerTeam,
    isBot: false,
    botDifficulty: null,
    connected: true,
    ready: true,
    guest: params.roomMakerGuest,
  };

  const roomData: RoomData = {
    code,
    passwordHash,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + 10 * 60 * 1000,
    roomMakerUid: params.roomMakerUid,
    status: 'lobby',
    lockedAfterStart: false,
    mode: params.mode,
    rulesetType: params.rulesetType,
    rulesetId: params.rulesetId,
    customRulesSummary: params.customRulesSummary,
    language: params.language,
    theme: params.theme,
    botSettings: params.botSettings,
    players: { [params.roomMakerUid]: roomMakerPlayer },
  };

  const roomRef = ref(database, `rooms/${code}`);
  await set(roomRef, roomData);

  return code;
}

/** Lobby membership check before join (e.g. fresh guest when same browser profile). */
export async function getLobbySeatInfo(
  code: string,
  playerUid: string
): Promise<{
  inRoom: boolean;
  seatCount: number;
  maxPlayers: number;
  existingPlayerName: string | null;
}> {
  const empty = { inRoom: false, seatCount: 0, maxPlayers: 0, existingPlayerName: null };
  if (!database) return empty;
  const snap = await get(ref(database, `rooms/${code}`));
  if (!snap.exists()) return empty;
  const room = snap.val() as RoomData;
  const maxPlayers = getMaxPlayers(room.mode);
  if (room.status !== 'lobby') {
    const me = room.players?.[playerUid];
    return {
      inRoom: Boolean(me),
      seatCount: 0,
      maxPlayers,
      existingPlayerName: me?.name ?? null,
    };
  }
  const players = room.players || {};
  const me = players[playerUid];
  return {
    inRoom: Boolean(me),
    seatCount: Object.keys(players).length,
    maxPlayers,
    existingPlayerName: me?.name ?? null,
  };
}

/**
 * Join an existing room.
 */
export async function joinRoom(params: {
  code: string;
  password: string;
  playerUid: string;
  playerName: string;
  playerGuest: boolean;
}): Promise<{ success: boolean; error?: string }> {
  if (!database) return { success: false, error: 'Firebase not configured' };

  const roomRef = ref(database, `rooms/${params.code}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    return { success: false, error: 'Room not found' };
  }

  const room = snapshot.val() as RoomData;

  if (isRoomExpired(room)) {
    return { success: false, error: 'Room expired' };
  }

  // Verify password
  const passwordValid = await verifyPassword(params.password, room.passwordHash);
  if (!passwordValid) {
    return { success: false, error: 'Incorrect password' };
  }

  const maxPlayers = getMaxPlayers(room.mode);
  const playerRef = ref(database, `rooms/${params.code}/players/${params.playerUid}`);

  // Reconnect during an active game — restore lobby + gameState connected flags.
  if (room.status !== 'lobby') {
    if (room.players[params.playerUid]) {
      const updates: Record<string, unknown> = {
        [`rooms/${params.code}/players/${params.playerUid}/connected`]: true,
      };
      const gsSnap = await get(ref(database, `rooms/${params.code}/gameState`));
      if (gsSnap.exists()) {
        const gameState = normalizeGameState(gsSnap.val());
        if (gameState) {
          const idx = gameStatePlayerIndex(gameState.players, params.playerUid);
          if (idx >= 0) {
            updates[`rooms/${params.code}/gameState/players/${idx}/connected`] = true;
          }
        }
      }
      await update(ref(database), updates);
      return { success: true };
    }
    return { success: false, error: 'Game already in progress' };
  }

  // New join: read players, claim seat, write own player node (rules allow self-create in lobby).
  const playersRef = ref(database, `rooms/${params.code}/players`);

  for (let attempt = 0; attempt < 4; attempt++) {
    const playersSnap = await get(playersRef);
    const currentPlayers = (playersSnap.val() || {}) as Record<string, PlayerState>;

    if (currentPlayers[params.playerUid]) {
      await set(ref(database, `rooms/${params.code}/players/${params.playerUid}/connected`), true);
      break;
    }

    if (Object.keys(currentPlayers).length >= maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

    const usedSeats = Object.values(currentPlayers).map((p) => p.seat);
    const nextSeat = getNextJoinSeat(room.mode, usedSeats);
    if (nextSeat === null) {
      return { success: false, error: 'Room is full' };
    }

    const color = colorForSeat(nextSeat);
    const team = room.mode === '4p_teams' ? TEAM_ASSIGNMENTS[nextSeat] : null;

    const newPlayer: PlayerState = {
      id: params.playerUid,
      uid: params.playerUid,
      name: params.playerName,
      color,
      seat: nextSeat,
      team,
      isBot: false,
      botDifficulty: null,
      connected: true,
      ready: false,
      guest: params.playerGuest,
    };

    try {
      await set(playerRef, newPlayer);
      break;
    } catch {
      const afterFail = await get(playerRef);
      if (afterFail.exists() && (afterFail.val() as PlayerState).uid === params.playerUid) {
        await set(ref(database, `rooms/${params.code}/players/${params.playerUid}/connected`), true);
        break;
      }
      if (attempt === 3) {
        return { success: false, error: 'Room is full or join denied' };
      }
    }
  }

  const updateRef = ref(database, `rooms/${params.code}`);
  void update(updateRef, { updatedAt: Date.now() }).catch((err) => {
    console.warn('joinRoom: updatedAt touch skipped', err);
  });

  return { success: true };
}

function normalizeDiscardPile(value: unknown): Card[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as Card[];
  if (typeof value === 'object') return Object.values(value as Record<string, Card>);
  return [];
}

async function appendToDiscardPile(code: string, cards: Card[]): Promise<void> {
  if (!database || cards.length === 0) return;
  const discardRef = ref(database, `rooms/${code}/gameState/discardPile`);
  await runTransaction(discardRef, (current) => {
    const pile = normalizeDiscardPile(current);
    return [...pile, ...cards];
  });
}

function gameStatePlayerIndex(players: PlayerState[], playerUid: string): number {
  return players.findIndex((p) => p.id === playerUid);
}

/** Next human host for bot turn driving when the current maker leaves mid-game. */
function pickNextRoomMakerUid(
  players: Record<string, PlayerState>,
  leavingUid: string
): string | null {
  const remaining = Object.values(players).filter((p) => p.id !== leavingUid);
  const connectedHumans = remaining
    .filter((p) => !p.isBot && p.connected !== false)
    .sort((a, b) => a.seat - b.seat);
  if (connectedHumans.length > 0) {
    return connectedHumans[0].id;
  }
  // Bot turns run only on the room maker's client — do not assign a disconnected human.
  return null;
}

/**
 * Leave a room. In lobby, removes the player node. During play, marks disconnected
 * and advances turn when the leaving player was up — keeps gameState turn order valid.
 */
export async function leaveRoom(code: string, playerUid: string): Promise<void> {
  if (!database) return;

  const roomRef = ref(database, `rooms/${code}`);
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) return;

  const room = snapshot.val() as RoomData & { gameState?: GameState };
  const now = Date.now();

  if (room.status === 'playing' && room.gameState && room.players[playerUid]) {
    const gameState = normalizeGameState(room.gameState);
    if (!gameState) {
      await remove(ref(database, `rooms/${code}/players/${playerUid}`));
      return;
    }
    const idx = gameStatePlayerIndex(gameState.players, playerUid);
    const leaverHand = await getPrivateHand(code, playerUid);
    const leaverCount = gameState.handCounts[playerUid] ?? leaverHand.length;

    const updates: Record<string, unknown> = {
      [`rooms/${code}/players/${playerUid}/connected`]: false,
    };

    if (leaverCount > 0 || leaverHand.length > 0) {
      updates[`rooms/${code}/gameState/handCounts/${playerUid}`] = 0;
      updates[`privateHands/${code}/${playerUid}/cards`] = [];
    }

    if (playerUid === room.roomMakerUid) {
      const nextMaker = pickNextRoomMakerUid(room.players, playerUid);
      if (nextMaker) {
        updates[`rooms/${code}/roomMakerUid`] = nextMaker;
      }
    }

    if (idx >= 0) {
      updates[`rooms/${code}/gameState/players/${idx}/connected`] = false;

      if (gameState.currentTurnPlayerId === playerUid) {
        const playersAfterLeave = gameState.players.map((p, i) =>
          i === idx ? { ...p, connected: false } : p
        );
        const stateAfterLeave: GameState = { ...gameState, players: playersAfterLeave };
        const next = getNextTurnPlayerAfterLeave(stateAfterLeave, playerUid);
        if (next) {
          updates[`rooms/${code}/gameState/currentTurnPlayerId`] = next.id;
          updates[`rooms/${code}/gameState/currentSeat`] = next.seat;
          updates[`rooms/${code}/gameState/turnNumber`] = gameState.turnNumber + 1;
        }
      }
    }

    await update(ref(database), updates);
    if (leaverHand.length > 0) {
      await appendToDiscardPile(code, leaverHand);
    }
    void update(roomRef, { updatedAt: now }).catch((err) => {
      console.warn('leaveRoom: updatedAt touch skipped', err);
    });
    return;
  }

  const playerRef = ref(database, `rooms/${code}/players/${playerUid}`);
  await remove(playerRef);

  void update(roomRef, { updatedAt: now }).catch((err) => {
    console.warn('leaveRoom: updatedAt touch skipped', err);
  });
}

/**
 * Kick a player (room maker only).
 */
export async function kickPlayer(code: string, playerUid: string): Promise<void> {
  await leaveRoom(code, playerUid);
}

/**
 * Set player ready status.
 */
export async function setPlayerReady(code: string, playerUid: string, ready: boolean): Promise<void> {
  if (!database) return;
  const readyRef = ref(database, `rooms/${code}/players/${playerUid}/ready`);
  await set(readyRef, ready);
}

/**
 * Update room status.
 * Writes status/updatedAt directly so non-makers can mark a room finished after winning.
 */
export async function updateRoomStatus(code: string, status: RoomData['status']): Promise<void> {
  if (!database) return;
  const now = Date.now();
  await update(ref(database, `rooms/${code}`), { status, updatedAt: now });
}

/**
 * Subscribe to room changes.
 */
export function subscribeToRoom(
  code: string,
  callback: (room: RoomData | null) => void
): () => void {
  if (!database) {
    callback(null);
    return () => {};
  }
  const roomRef = ref(database, `rooms/${code}`);
  const unsubscribe = onValue(roomRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as RoomData);
    } else {
      callback(null);
    }
  });
  return unsubscribe;
}

/**
 * Add bots to fill empty seats.
 */
export async function addBots(
  code: string,
  count: number,
  difficulty: string,
  mode: GameMode,
  preferredSeat?: number
): Promise<void> {
  if (!database) return;
  const roomRef = ref(database, `rooms/${code}`);
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) return;

  const room = snapshot.val() as RoomData;
  const usedSeats = Object.values(room.players).map((p) => p.seat);
  let botsAdded = 0;

  const validSeats = getSeatSlotsForMode(mode);
  const seatOrder =
    preferredSeat !== undefined ? [preferredSeat] : validSeats;

  for (const seat of seatOrder) {
    if (botsAdded >= count) break;
    if (!validSeats.includes(seat)) continue;
    if (usedSeats.includes(seat)) continue;

    const botId = `bot_${seat}_${Date.now()}`;
    const color = colorForSeat(seat);
    const team = mode === '4p_teams' ? TEAM_ASSIGNMENTS[seat] : null;

    const botPlayer: PlayerState = {
      id: botId,
      uid: botId,
      name: `Bot ${seat + 1}`,
      color,
      seat,
      team,
      isBot: true,
      botDifficulty: difficulty as PlayerState['botDifficulty'],
      connected: true,
      ready: true,
      guest: false,
    };

    const botRef = ref(database, `rooms/${code}/players/${botId}`);
    await set(botRef, botPlayer);
    usedSeats.push(seat);
    botsAdded++;
  }
}

// ============================================================================
// GAME STATE FIREBASE
// ============================================================================

/** Read current game state from RTDB (authoritative snapshot for move validation). */
export async function getGameState(code: string): Promise<GameState | null> {
  if (!database) return null;
  const gameRef = ref(database, `rooms/${code}/gameState`);
  const snapshot = await get(gameRef);
  return snapshot.exists() ? normalizeGameState(snapshot.val()) : null;
}

/**
 * Persist game state under /rooms/{code}/gameState.
 * Uses update() so child-level RTDB rules apply; a parent set() is rejected for non-makers.
 */
export async function saveGameState(code: string, gameState: any): Promise<void> {
  if (!database) return;
  const gameRef = ref(database, `rooms/${code}/gameState`);
  await update(gameRef, gameState);
}

export type SaveGameStateIfMatchResult =
  | { ok: true }
  | { ok: false; reason: 'stale' | 'not_found' };

/**
 * Compare-and-set write for moves: re-reads gameState inside an RTDB transaction
 * and commits only when turnNumber + currentTurnPlayerId still match expectations.
 *
 * Private hands are updated separately — they cannot be atomic with public gameState.
 * If hand writes fail after a successful commit, public state may be ahead of hands
 * until a retry or the next deal; callers should treat transaction failure as safe to retry.
 */
export async function saveGameStateIfMatch(
  code: string,
  expectedTurnNumber: number,
  expectedCurrentPlayerId: string,
  newState: GameState
): Promise<SaveGameStateIfMatchResult> {
  if (!database) return { ok: false, reason: 'not_found' };

  const gameRef = ref(database, `rooms/${code}/gameState`);
  const result = await runTransaction(gameRef, (current) => {
    const currentState = normalizeGameState(current);
    if (
      !canCommitMoveTransaction(
        currentState,
        expectedTurnNumber,
        expectedCurrentPlayerId,
        newState
      )
    ) {
      return;
    }
    return newState;
  });

  if (!result.committed) {
    return { ok: false, reason: 'stale' };
  }
  return { ok: true };
}

/**
 * Partial game state patch (same path as saveGameState).
 */
export async function updateGameState(code: string, updates: any): Promise<void> {
  await saveGameState(code, updates);
}

/**
 * Save private hand for a player.
 */

export async function getPrivateHand(code: string, playerId: string): Promise<Card[]> {
  if (!database) return [];
  const handRef = ref(database, `privateHands/${code}/${playerId}/cards`);
  const snapshot = await get(handRef);
  return snapshot.exists() ? normalizeCards(snapshot.val()) : [];
}

export async function savePrivateHand(code: string, playerId: string, cards: any[]): Promise<void> {
  if (!database) return;
  const handRef = ref(database, `privateHands/${code}/${playerId}/cards`);
  await set(handRef, cards);
}

const DEFAULT_HAND_WRITE_ATTEMPTS = 3;
const DEFAULT_HAND_WRITE_DELAY_MS = 150;

export const HAND_SYNC_FAILED_ERROR = 'game.handSyncFailed';

/**
 * Retry private hand writes after a successful public gameState commit.
 * Public state may already be ahead if all attempts fail — caller should surface HAND_SYNC_FAILED_ERROR.
 */
export async function savePrivateHandWithRetry(
  code: string,
  playerId: string,
  cards: Card[],
  options?: { attempts?: number; delayMs?: number }
): Promise<{ ok: true } | { ok: false; error: typeof HAND_SYNC_FAILED_ERROR }> {
  const attempts = options?.attempts ?? DEFAULT_HAND_WRITE_ATTEMPTS;
  const delayMs = options?.delayMs ?? DEFAULT_HAND_WRITE_DELAY_MS;

  for (let i = 1; i <= attempts; i++) {
    try {
      await savePrivateHand(code, playerId, cards);
      return { ok: true };
    } catch (err) {
      console.error(
        `[Jakaroo] savePrivateHand failed (${i}/${attempts}) room=${code} player=${playerId}`,
        err
      );
      if (i < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  return { ok: false, error: HAND_SYNC_FAILED_ERROR };
}

/**
 * Subscribe to game state changes.
 */
export function subscribeToGameState(
  code: string,
  callback: (state: GameState | null) => void
): () => void {
  if (!database) return () => {};
  const gameRef = ref(database, `rooms/${code}/gameState`);
  return onValue(gameRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      callback(normalizeGameState(snapshot.val()));
    } else {
      callback(null);
    }
  });
}

/**
 * Subscribe to own private hand.
 */
export function subscribeToPrivateHand(
  code: string,
  playerId: string,
  callback: (cards: Card[]) => void
): () => void {
  if (!database) return () => {};
  const handRef = ref(database, `privateHands/${code}/${playerId}/cards`);
  return onValue(handRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      callback(normalizeCards(snapshot.val()));
    } else {
      callback([]);
    }
  });
}

// ============================================================================
// CUSTOM RULES TEMPLATES
// ============================================================================

/**
 * Save a custom rules template for a user.
 */
export async function saveCustomTemplate(
  uid: string,
  templateId: string,
  config: CustomRulesConfig
): Promise<void> {
  if (!database) return;
  const templateRef = ref(database, `users/${uid}/customRules/${templateId}`);
  await set(templateRef, {
    ...config,
    updatedAt: Date.now(),
  });
}

/**
 * Get all custom templates for a user.
 */
export async function getCustomTemplates(uid: string): Promise<Record<string, CustomRulesConfig>> {
  if (!database) return {};
  const templatesRef = ref(database, `users/${uid}/customRules`);
  const snapshot = await get(templatesRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {};
}

/**
 * Delete a custom template.
 */
export async function deleteCustomTemplate(uid: string, templateId: string): Promise<void> {
  if (!database) return;
  const templateRef = ref(database, `users/${uid}/customRules/${templateId}`);
  await remove(templateRef);
}

// ============================================================================
// HELPERS
// ============================================================================

function getMaxPlayers(mode: GameMode): number {
  switch (mode) {
    case '4p_teams': return 4;
    case '3p_solo': return 3;
    case '2p_solo': return 2;
  }
}

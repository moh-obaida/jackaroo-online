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

  // Verify password
  const passwordValid = await verifyPassword(params.password, room.passwordHash);
  if (!passwordValid) {
    return { success: false, error: 'Incorrect password' };
  }

  const maxPlayers = getMaxPlayers(room.mode);
  const playerRef = ref(database, `rooms/${params.code}/players/${params.playerUid}`);

  // Reconnect during an active game — only flip connected (rules allow this path).
  if (room.status !== 'lobby') {
    if (room.players[params.playerUid]) {
      await set(ref(database, `rooms/${params.code}/players/${params.playerUid}/connected`), true);
      return { success: true };
    }
    return { success: false, error: 'Game already in progress' };
  }

  // New join: claim a seat via per-player transaction (rules enforce lobby + capacity).
  const playersSnap = await get(ref(database, `rooms/${params.code}/players`));
  const currentPlayers = (playersSnap.val() || {}) as Record<string, PlayerState>;

  if (currentPlayers[params.playerUid]) {
    await set(ref(database, `rooms/${params.code}/players/${params.playerUid}/connected`), true);
    return { success: true };
  }

  if (Object.keys(currentPlayers).length >= maxPlayers) {
    return { success: false, error: 'Room is full' };
  }

  const usedSeats = Object.values(currentPlayers).map((p) => p.seat);
  let nextSeat = 0;
  while (usedSeats.includes(nextSeat)) nextSeat++;

  const color = COLORS_ORDER[nextSeat];
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

  const txnResult = await runTransaction(playerRef, (current) => {
    if (current) {
      return { ...current, connected: true };
    }
    return newPlayer;
  });

  if (!txnResult.committed) {
    return { success: false, error: 'Room is full or join denied' };
  }

  const updateRef = ref(database, `rooms/${params.code}`);
  await update(updateRef, { updatedAt: Date.now() });

  return { success: true };
}

/**
 * Leave a room.
 */
export async function leaveRoom(code: string, playerUid: string): Promise<void> {
  if (!database) return;
  const playerRef = ref(database, `rooms/${code}/players/${playerUid}`);
  await remove(playerRef);

  const updateRef = ref(database, `rooms/${code}`);
  await update(updateRef, { updatedAt: Date.now() });
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
  mode: GameMode
): Promise<void> {
  if (!database) return;
  const roomRef = ref(database, `rooms/${code}`);
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) return;

  const room = snapshot.val() as RoomData;
  const usedSeats = Object.values(room.players).map((p) => p.seat);
  const maxPlayers = getMaxPlayers(mode);
  let botsAdded = 0;

  for (let seat = 0; seat < maxPlayers && botsAdded < count; seat++) {
    if (usedSeats.includes(seat)) continue;

    const botId = `bot_${seat}_${Date.now()}`;
    const color = COLORS_ORDER[seat];
    const team = mode === '4p_teams' ? TEAM_ASSIGNMENTS[seat] : null;

    const botPlayer: PlayerState = {
      id: botId,
      uid: botId,
      name: `Bot ${seat + 1}`,
      color,
      seat,
      team,
      isBot: true,
      botDifficulty: difficulty as any,
      connected: true,
      ready: true,
      guest: false,
    };

    const botRef = ref(database, `rooms/${code}/players/${botId}`);
    await set(botRef, botPlayer);
    botsAdded++;
  }
}

// ============================================================================
// GAME STATE FIREBASE
// ============================================================================

/**
 * Save initial game state to Firebase when game starts.
 */
export async function saveGameState(code: string, gameState: any): Promise<void> {
  if (!database) return;
  const gameRef = ref(database, `rooms/${code}/gameState`);
  await set(gameRef, gameState);
}

/**
 * Update game state in Firebase after an action.
 */
export async function updateGameState(code: string, updates: any): Promise<void> {
  if (!database) return;
  const gameRef = ref(database, `rooms/${code}/gameState`);
  await update(gameRef, updates);
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

// ============================================================================
// BOARD MODULE — Board model, position resolution, path computation
// Board: 18 track spots × 4 colors + 4 start/gate + 16 home spots = 92 playable
// ============================================================================

import {
  BoardPosition,
  PlayerColor,
  Marble,
  COLORS_ORDER,
  TRACK_LENGTH,
  HOME_LENGTH,
  GameMode,
} from '../../types/game';

// ============================================================================
// POSITION HELPERS
// ============================================================================

export function positionEquals(a: BoardPosition, b: BoardPosition): boolean {
  return a.color === b.color && a.type === b.type && a.index === b.index;
}

export function positionToString(pos: BoardPosition): string {
  return `${pos.color}_${pos.type}_${pos.index}`;
}

export function stringToPosition(str: string): BoardPosition {
  const parts = str.split('_');
  const color = parts[0] as PlayerColor;
  const type = parts.slice(1, -1).join('_') as BoardPosition['type'];
  const index = parseInt(parts[parts.length - 1]);
  return { color, type, index };
}

/**
 * Create initial marble positions (all in base).
 */
export function createInitialMarbles(activeColors: PlayerColor[]): Marble[] {
  const marbles: Marble[] = [];
  for (const color of activeColors) {
    for (let i = 0; i < 4; i++) {
      marbles.push({
        id: `${color}_marble_${i}`,
        color,
        position: { color, type: 'base', index: i },
        isFinished: false,
      });
    }
  }
  return marbles;
}

/**
 * Get the active colors for a given game mode.
 */
export function getActiveColors(mode: GameMode, selectedColors?: PlayerColor[]): PlayerColor[] {
  switch (mode) {
    case '4p_teams':
      return [...COLORS_ORDER];
    case '3p_solo':
      return selectedColors?.slice(0, 3) || COLORS_ORDER.slice(0, 3);
    case '2p_solo':
      // Players sit opposite: typically black and blue (seats 0 and 2)
      return selectedColors?.slice(0, 2) || ['black', 'blue'];
  }
}

// ============================================================================
// MAIN TRACK PATH — Circular movement around the board
// The main track is a circle of 72 spots (18 per color section).
// The order is: black_track_0..17, green_track_0..17, blue_track_0..17, white_track_0..17
// ============================================================================

/**
 * Get the global track index (0-71) for a track position.
 */
export function getGlobalTrackIndex(pos: BoardPosition): number {
  if (pos.type !== 'track' && pos.type !== 'start_gate') return -1;
  const colorIndex = COLORS_ORDER.indexOf(pos.color);
  if (pos.type === 'start_gate') {
    // Start/gate is at the beginning of each color's section (index 0 of their track)
    return colorIndex * TRACK_LENGTH;
  }
  return colorIndex * TRACK_LENGTH + pos.index;
}

/**
 * Get the board position from a global track index (0-71).
 */
export function getPositionFromGlobalIndex(globalIndex: number): BoardPosition {
  const normalized = ((globalIndex % 72) + 72) % 72;
  const colorIndex = Math.floor(normalized / TRACK_LENGTH);
  const spotIndex = normalized % TRACK_LENGTH;
  const color = COLORS_ORDER[colorIndex];

  // The start/gate spot is at index 0 of each color's section
  if (spotIndex === 0) {
    return { color, type: 'start_gate', index: 0 };
  }
  return { color, type: 'track', index: spotIndex };
}

/**
 * Get the start/gate position for a color.
 */
export function getStartGatePosition(color: PlayerColor): BoardPosition {
  return { color, type: 'start_gate', index: 0 };
}

/**
 * Check if a position is the start/gate of a specific color.
 */
export function isOwnStartGate(pos: BoardPosition, color: PlayerColor): boolean {
  return pos.type === 'start_gate' && pos.color === color;
}

/**
 * Check if a marble is on its own start/gate (locked blocker).
 */
export function isLockedOnOwnStartGate(marble: Marble): boolean {
  return marble.position.type === 'start_gate' && marble.position.color === marble.color;
}

/**
 * Check if a marble is in base.
 */
export function isInBase(marble: Marble): boolean {
  return marble.position.type === 'base';
}

/**
 * Check if a marble is in home.
 */
export function isInHome(marble: Marble): boolean {
  return marble.position.type === 'home';
}

/**
 * Check if a marble is on the active main track (track or start_gate).
 */
export function isOnMainTrack(marble: Marble): boolean {
  return marble.position.type === 'track' || marble.position.type === 'start_gate';
}

// ============================================================================
// HOME ENTRY LOGIC
// ============================================================================

/**
 * Get the home entry point for a color.
 * The home entry is reached after completing the full track loop.
 * A marble enters home from the spot just before its own start/gate
 * (i.e., the last spot of the previous color's section).
 * 
 * For forward movement: a marble enters home when it reaches the spot
 * just before its own start/gate after going around.
 * 
 * The "home entry global index" is the global index of the last track spot
 * before the player's start/gate.
 */
export function getHomeEntryGlobalIndex(color: PlayerColor): number {
  const colorIndex = COLORS_ORDER.indexOf(color);
  // Home entry is the spot just before the start/gate
  // Start/gate is at colorIndex * 18, so entry is at (colorIndex * 18 - 1 + 72) % 72
  return (colorIndex * TRACK_LENGTH - 1 + 72) % 72;
}

/**
 * Calculate the distance from a marble's current position to its home entry.
 * Returns the number of forward steps needed to reach home entry.
 * Returns -1 if not on main track.
 */
export function distanceToHomeEntry(marblePos: BoardPosition, marbleColor: PlayerColor): number {
  if (marblePos.type !== 'track' && marblePos.type !== 'start_gate') return -1;

  const currentGlobal = getGlobalTrackIndex(marblePos);
  const homeEntryGlobal = getHomeEntryGlobalIndex(marbleColor);

  if (currentGlobal === homeEntryGlobal) return 0;

  // Forward distance around the circular track
  return (homeEntryGlobal - currentGlobal + 72) % 72;
}

/**
 * Check if a forward move from a position would pass through or land on the home entry.
 * If so, and the marble can enter home, calculate how many steps go into home.
 */
export function calculateHomeEntry(
  marblePos: BoardPosition,
  marbleColor: PlayerColor,
  steps: number
): { entersHome: boolean; homeIndex: number; remainingOnTrack: number } {
  const distToHome = distanceToHomeEntry(marblePos, marbleColor);

  if (distToHome < 0) {
    return { entersHome: false, homeIndex: -1, remainingOnTrack: steps };
  }

  // If steps exactly reach or pass home entry
  if (steps > distToHome) {
    const stepsIntoHome = steps - distToHome - 1; // -1 because entering home costs one step past entry
    if (stepsIntoHome >= 0 && stepsIntoHome < HOME_LENGTH) {
      return { entersHome: true, homeIndex: stepsIntoHome, remainingOnTrack: 0 };
    }
    // Overshooting home — invalid
    return { entersHome: false, homeIndex: -1, remainingOnTrack: steps };
  }

  return { entersHome: false, homeIndex: -1, remainingOnTrack: steps };
}

/**
 * For backward-4 from start/gate: calculate if it reaches home.
 * Moving backward from start/gate means going in reverse around the track.
 * The home entry for backward is the same entry point but approached from the other direction.
 * 
 * When on own start/gate and moving backward 4:
 * - Move backward 4 spots from start/gate
 * - This goes to the spots just before start/gate (which is the home entry area)
 * - If the backward path reaches home entry (1 step back from start/gate), 
 *   the marble can enter home with remaining steps.
 * 
 * Actually: backward from own start/gate goes toward home entry directly.
 * Start/gate is at global index colorIndex * 18.
 * Going backward 1 step = global index (colorIndex * 18 - 1 + 72) % 72 = home entry.
 * So backward 1 from own start/gate = home entry.
 * Backward 2 = home_0, backward 3 = home_1, backward 4 = home_2... wait.
 * 
 * Correction: backward from start/gate:
 * - 1 step back = the home entry spot (last track spot before start/gate)
 *   But this is still on the main track. Home entry means you CAN turn into home.
 * - So backward from start/gate: step 1 goes to home entry track spot,
 *   then steps 2,3,4 go into home_0, home_1, home_2.
 * 
 * Result: backward 4 from own start/gate = home index 2 (third home spot).
 */
export function calculateBackward4FromStartGate(
  marbleColor: PlayerColor,
  marbles: Marble[]
): BoardPosition | null {
  // Backward from own start/gate:
  // Step 1: reach home entry (track spot before start/gate)
  // Steps 2-4: enter home spots 0, 1, 2
  // So backward 4 from start/gate = home index 2
  const targetHomeIndex = 2; // 4 - 1 (entry step) - 1 (zero-indexed) = 2

  // Check if home spots 0, 1, 2 are available (no blocking marbles in the way)
  const homeMarbles = marbles.filter(
    (m) => m.color === marbleColor && m.position.type === 'home'
  );

  // Check each home spot from 0 to targetHomeIndex
  for (let i = 0; i <= targetHomeIndex; i++) {
    const occupied = homeMarbles.find((m) => m.position.index === i);
    if (occupied) {
      // Can only go up to the spot before the blocker
      if (i === 0) return null; // Can't enter home at all
      // Return the spot just before the blocker... but we need exact 4 steps
      // If blocked, the backward-4 move is invalid
      return null;
    }
  }

  return { color: marbleColor, type: 'home', index: targetHomeIndex };
}

/**
 * Calculate backward 4 from any main track position.
 * Returns the target position after moving backward 4.
 * If the marble is on its own start/gate, uses special home entry logic.
 */
export function calculateBackward4(
  marble: Marble,
  allMarbles: Marble[]
): BoardPosition | null {
  const pos = marble.position;

  // Special case: on own start/gate
  if (isOwnStartGate(pos, marble.color)) {
    return calculateBackward4FromStartGate(marble.color, allMarbles);
  }

  // Normal backward 4 on main track
  if (pos.type !== 'track' && pos.type !== 'start_gate') return null;

  const currentGlobal = getGlobalTrackIndex(pos);
  const targetGlobal = (currentGlobal - 4 + 72) % 72;

  // Check if backward path passes through any locked start/gate
  for (let step = 1; step <= 4; step++) {
    const checkGlobal = (currentGlobal - step + 72) % 72;
    const checkPos = getPositionFromGlobalIndex(checkGlobal);
    if (checkPos.type === 'start_gate') {
      // Check if owner's marble is locked there
      const blocker = allMarbles.find(
        (m) => isLockedOnOwnStartGate(m) && m.position.color === checkPos.color
      );
      if (blocker && blocker.id !== marble.id) {
        return null; // Path blocked
      }
    }
  }

  // Check if backward movement from own start/gate area can enter home
  // For non-start-gate positions, backward 4 just goes backward on track
  const homeEntryGlobal = getHomeEntryGlobalIndex(marble.color);
  
  // Check if we pass through home entry going backward
  // This is tricky: backward from a position near home entry could enter home
  // But in Obaida Classic, backward-4 home entry is specifically from start/gate
  // For other positions, backward 4 just stays on track
  
  return getPositionFromGlobalIndex(targetGlobal);
}

// ============================================================================
// PATH CHECKING — Blockers
// ============================================================================

/**
 * Get all positions in the forward path from current to target (exclusive of current, inclusive of target).
 */
export function getForwardPath(
  fromPos: BoardPosition,
  steps: number
): BoardPosition[] {
  if (fromPos.type !== 'track' && fromPos.type !== 'start_gate') return [];

  const path: BoardPosition[] = [];
  const startGlobal = getGlobalTrackIndex(fromPos);

  for (let i = 1; i <= steps; i++) {
    const globalIdx = (startGlobal + i) % 72;
    path.push(getPositionFromGlobalIndex(globalIdx));
  }

  return path;
}

/**
 * Check if a forward path is blocked by a locked start/gate marble.
 * Returns true if blocked.
 */
export function isPathBlocked(
  fromPos: BoardPosition,
  steps: number,
  marbles: Marble[],
  movingMarbleId: string
): boolean {
  const path = getForwardPath(fromPos, steps);

  for (const pathPos of path) {
    if (pathPos.type === 'start_gate') {
      const blocker = marbles.find(
        (m) =>
          m.id !== movingMarbleId &&
          isLockedOnOwnStartGate(m) &&
          positionEquals(m.position, pathPos)
      );
      if (blocker) return true;
    }
  }

  return false;
}

/**
 * Check if a backward path is blocked by a locked start/gate marble.
 */
export function isBackwardPathBlocked(
  fromPos: BoardPosition,
  steps: number,
  marbles: Marble[],
  movingMarbleId: string
): boolean {
  if (fromPos.type !== 'track' && fromPos.type !== 'start_gate') return false;

  const startGlobal = getGlobalTrackIndex(fromPos);

  for (let i = 1; i <= steps; i++) {
    const globalIdx = (startGlobal - i + 72) % 72;
    const checkPos = getPositionFromGlobalIndex(globalIdx);
    if (checkPos.type === 'start_gate') {
      const blocker = marbles.find(
        (m) =>
          m.id !== movingMarbleId &&
          isLockedOnOwnStartGate(m) &&
          positionEquals(m.position, checkPos)
      );
      if (blocker) return true;
    }
  }

  return false;
}

/**
 * For King movement: get all marbles in the path that will be eaten.
 * King eats everyone in its path on the main track (not just the landing spot).
 */
export function getMarblesInPath(
  fromPos: BoardPosition,
  steps: number,
  marbles: Marble[],
  movingMarbleId: string
): Marble[] {
  const path = getForwardPath(fromPos, steps);
  const eaten: Marble[] = [];

  for (const pathPos of path) {
    const marbleOnSpot = marbles.find(
      (m) =>
        m.id !== movingMarbleId &&
        isOnMainTrack(m) &&
        !m.isFinished &&
        positionEquals(m.position, pathPos) &&
        !isLockedOnOwnStartGate(m)
    );
    if (marbleOnSpot) {
      eaten.push(marbleOnSpot);
    }
  }

  return eaten;
}

/**
 * Get the marble at a specific position (if any).
 */
export function getMarbleAtPosition(
  pos: BoardPosition,
  marbles: Marble[],
  excludeMarbleId?: string
): Marble | undefined {
  return marbles.find(
    (m) =>
      m.id !== excludeMarbleId &&
      !m.isFinished &&
      positionEquals(m.position, pos)
  );
}

/**
 * Calculate the forward target position for a marble moving N steps.
 * Handles home entry if applicable.
 * Returns null if the move is invalid (overshoot, blocked, etc.).
 */
export function calculateForwardTarget(
  marble: Marble,
  steps: number,
  allMarbles: Marble[]
): BoardPosition | null {
  if (marble.position.type !== 'track' && marble.position.type !== 'start_gate') {
    return null;
  }

  // Check for home entry
  const homeCalc = calculateHomeEntry(marble.position, marble.color, steps);

  if (homeCalc.entersHome) {
    // Verify home spots are accessible (no blocking in home)
    const homeMarbles = allMarbles.filter(
      (m) => m.color === marble.color && m.position.type === 'home' && m.id !== marble.id
    );

    // Check all home spots from 0 to target are clear
    for (let i = 0; i <= homeCalc.homeIndex; i++) {
      if (homeMarbles.find((m) => m.position.index === i)) {
        return null; // Blocked in home
      }
    }

    // Also check the track path up to home entry for locked blockers
    const distToHome = distanceToHomeEntry(marble.position, marble.color);
    if (isPathBlocked(marble.position, distToHome, allMarbles, marble.id)) {
      return null;
    }

    return { color: marble.color, type: 'home', index: homeCalc.homeIndex };
  }

  // Normal forward movement on track
  if (isPathBlocked(marble.position, steps, allMarbles, marble.id)) {
    return null;
  }

  const currentGlobal = getGlobalTrackIndex(marble.position);
  const targetGlobal = (currentGlobal + steps) % 72;
  const targetPos = getPositionFromGlobalIndex(targetGlobal);

  // Check if landing on a locked start/gate (can't land there either)
  if (targetPos.type === 'start_gate') {
    const blocker = allMarbles.find(
      (m) =>
        m.id !== marble.id &&
        isLockedOnOwnStartGate(m) &&
        positionEquals(m.position, targetPos)
    );
    if (blocker) return null;
  }

  return targetPos;
}

/**
 * Move a marble inside home (for 7 split or other valid home movement).
 * Returns target home position or null if invalid.
 */
export function calculateHomeMoveForward(
  marble: Marble,
  steps: number,
  allMarbles: Marble[]
): BoardPosition | null {
  if (marble.position.type !== 'home') return null;

  const targetIndex = marble.position.index + steps;
  if (targetIndex >= HOME_LENGTH) return null; // Overshoot

  // Check no marble blocking in between
  const homeMarbles = allMarbles.filter(
    (m) => m.color === marble.color && m.position.type === 'home' && m.id !== marble.id
  );

  for (let i = marble.position.index + 1; i <= targetIndex; i++) {
    if (homeMarbles.find((m) => m.position.index === i)) {
      return null; // Blocked
    }
  }

  return { color: marble.color, type: 'home', index: targetIndex };
}

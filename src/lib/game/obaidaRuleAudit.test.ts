import { describe, expect, it } from 'vitest';
import { applyAction } from './applyAction';
import { generateLegalActions } from './legalMoves';
import {
  calculateBackward4,
  calculateForwardTarget,
  calculateHomeMoveForward,
  getHomeEntryGlobalIndex,
  getMarblesInPath,
  getPositionFromGlobalIndex,
  getStartGatePosition,
  isPathBlocked,
} from './board';
import { makeBaseState, makeCard, makePlayer, placeMarble } from './testFixtures';

describe('Obaida Classic rule audit — board movement', () => {
  const p1 = makePlayer('p1', 'black', 0);
  const p2 = makePlayer('p2', 'blue', 2);

  function blackOnGate(marbles = makeBaseState('2p_solo', [p1, p2], 'p1').marbles) {
    const id = marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    return placeMarble(marbles, id, getStartGatePosition('black'));
  }

  it('backward 4 from own start/gate is legal and targets home index 2 when home empty', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', { handCounts: { p1: 1, p2: 0 } });
    const marbles = blackOnGate(state.marbles);
    const marble = marbles.find((m) => m.color === 'black' && m.position.type === 'start_gate')!;
    const target = calculateBackward4(marble, marbles);
    expect(target).toEqual({ color: 'black', type: 'home', index: 2 });

    const actions = generateLegalActions({ ...state, marbles }, [makeCard('4')]);
    expect(actions.some((a) => a.type === 'move_backward')).toBe(true);
  });

  it('cannot skip empty home slots when entering from track (exact next slot only)', () => {
    const marbles = blackOnGate();
    const marbleId = marbles.find((m) => m.color === 'black')!.id;
    const entryPos = getPositionFromGlobalIndex(getHomeEntryGlobalIndex('black'));
    const onEntry = placeMarble(marbles, marbleId, entryPos);
    const marble = onEntry.find((m) => m.id === marbleId)!;

    expect(calculateForwardTarget(marble, 1, onEntry)).toEqual({
      color: 'black',
      type: 'home',
      index: 0,
    });
    expect(calculateForwardTarget(marble, 3, onEntry)).toBeNull();
  });

  it('home advance only into next vacant slot (e.g. 2→3 when 0–2 filled)', () => {
    const base = makeBaseState('2p_solo', [p1, p2], 'p1').marbles;
    const ids = base.filter((m) => m.color === 'black' && m.position.type === 'base');
    let marbles = placeMarble(base, ids[0].id, { color: 'black', type: 'home', index: 0 });
    marbles = placeMarble(marbles, ids[1].id, { color: 'black', type: 'home', index: 1 });
    marbles = placeMarble(marbles, ids[2].id, { color: 'black', type: 'home', index: 2 });
    const marble = marbles.find((m) => m.id === ids[2].id)!;

    expect(calculateHomeMoveForward(marble, 1, marbles)).toEqual({
      color: 'black',
      type: 'home',
      index: 3,
    });
    expect(calculateHomeMoveForward(marble, 2, marbles)).toBeNull();
  });

  it('lone marble at home[2] cannot skip vacant 0–1 (post backward-4 staging risk)', () => {
    const marbles = blackOnGate();
    const marbleId = marbles.find((m) => m.color === 'black')!.id;
    const inHome2 = placeMarble(marbles, marbleId, { color: 'black', type: 'home', index: 2 });
    const marble = inHome2.find((m) => m.id === marbleId)!;
    expect(calculateHomeMoveForward(marble, 1, inHome2)).toBeNull();
  });

  it('cannot advance in home if next slot is not vacant (fill order)', () => {
    const base = makeBaseState('2p_solo', [p1, p2], 'p1').marbles;
    const leadId = base.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const blockId = base.find((m) => m.color === 'black' && m.position.type === 'base' && m.id !== leadId)!.id;
    let marbles = placeMarble(base, leadId, { color: 'black', type: 'home', index: 0 });
    marbles = placeMarble(marbles, blockId, { color: 'black', type: 'home', index: 2 });
    const marble = marbles.find((m) => m.id === leadId)!;
    expect(calculateHomeMoveForward(marble, 2, marbles)).toBeNull();
  });
});

describe('Obaida Classic rule audit — start/gate blocker', () => {
  const p1 = makePlayer('p1', 'black', 0);
  const p2 = makePlayer('p2', 'blue', 2);

  it('forward path blocked by locked own start/gate marble', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1');
    const gate = getStartGatePosition('black');
    const blackId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const blueId = state.marbles.find((m) => m.color === 'blue' && m.position.type === 'base')!.id;
    let marbles = placeMarble(state.marbles, blackId, gate);
    marbles = placeMarble(marbles, blueId, { color: 'black', type: 'track', index: 0 });
    const mover = marbles.find((m) => m.id === blueId)!;
    const stepsToGate = 75;

    expect(isPathBlocked(mover.position, stepsToGate, marbles, blueId)).toBe(true);
    expect(calculateForwardTarget(mover, stepsToGate, marbles)).toBeNull();
  });

  it('Jack cannot swap locked start/gate marble', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const gate = getStartGatePosition('black');
    const blackId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const blueId = state.marbles.find((m) => m.color === 'blue' && m.position.type === 'base')!.id;
    let marbles = placeMarble(state.marbles, blackId, gate);
    marbles = placeMarble(marbles, blueId, { color: 'blue', type: 'track', index: 4 });
    const actions = generateLegalActions({ ...state, marbles }, [makeCard('J')]);
    const swapUsesGate = actions.some(
      (a) =>
        a.type === 'swap' &&
        (a.swapMarbleId1 === blackId || a.swapMarbleId2 === blackId)
    );
    expect(swapUsesGate).toBe(false);
  });

  it('Five cannot move locked start/gate marble', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const gate = getStartGatePosition('black');
    const blackId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const marbles = placeMarble(state.marbles, blackId, gate);
    const actions = generateLegalActions({ ...state, marbles }, [makeCard('5')]);
    expect(actions.some((a) => a.marbleId === blackId)).toBe(false);
  });
});

describe('Obaida Classic rule audit — King path eating', () => {
  const p1 = makePlayer('p1', 'black', 0);
  const p2 = makePlayer('p2', 'blue', 2);

  it('King 13 path includes active marbles on main track (not locked gate)', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1');
    const moverId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const victimId = state.marbles.find((m) => m.color === 'blue' && m.position.type === 'base')!.id;
    let marbles = placeMarble(state.marbles, moverId, { color: 'black', type: 'track', index: 0 });
    marbles = placeMarble(marbles, victimId, { color: 'black', type: 'track', index: 3 });
    const mover = marbles.find((m) => m.id === moverId)!;
    const eaten = getMarblesInPath(mover.position, 13, marbles, moverId);
    expect(eaten.some((m) => m.id === victimId)).toBe(true);
  });

  it('King path does not eat locked start/gate blocker', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1');
    const gate = getStartGatePosition('blue');
    const moverId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const blockerId = state.marbles.find((m) => m.color === 'blue' && m.position.type === 'base')!.id;
    let marbles = placeMarble(state.marbles, moverId, { color: 'black', type: 'track', index: 0 });
    marbles = placeMarble(marbles, blockerId, gate);
    const mover = marbles.find((m) => m.id === moverId)!;
    const eaten = getMarblesInPath(mover.position, 13, marbles, moverId);
    expect(eaten.some((m) => m.id === blockerId)).toBe(false);
  });

  it('applyAction King 13 sends path victims to base', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
      turnNumber: 1,
    });
    const hand = [makeCard('K')];
    const moverId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const victimId = state.marbles.find((m) => m.color === 'blue' && m.position.type === 'base')!.id;
    let marbles = placeMarble(state.marbles, moverId, { color: 'black', type: 'track', index: 0 });
    marbles = placeMarble(marbles, victimId, { color: 'black', type: 'track', index: 3 });
    const target = calculateForwardTarget(
      marbles.find((m) => m.id === moverId)!,
      13,
      marbles
    );
    expect(target).not.toBeNull();

    const result = applyAction(
      { ...state, marbles },
      {
        type: 'move',
        playerId: 'p1',
        cardId: hand[0].id,
        marbleId: moverId,
        targetPosition: target!,
      },
      hand
    );
    const victim = result.state.marbles.find((m) => m.id === victimId);
    expect(victim?.position.type).toBe('base');
  });
});

describe('Obaida Classic rule audit — Five / Jack / burn / bring-out', () => {
  const p1 = makePlayer('p1', 'black', 0);
  const p2 = makePlayer('p2', 'blue', 2);

  it('Five cannot move base or home marbles', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const baseId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const actions = generateLegalActions(state, [makeCard('5')]);
    expect(actions.some((a) => a.marbleId === baseId)).toBe(false);

    let marbles = placeMarble(state.marbles, baseId, { color: 'black', type: 'home', index: 0 });
    const homeActions = generateLegalActions({ ...state, marbles }, [makeCard('5')]);
    expect(homeActions.some((a) => a.marbleId === baseId)).toBe(false);
  });

  it('Five cannot enter home on opponent marble move', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const blueId = state.marbles.find((m) => m.color === 'blue' && m.position.type === 'base')!.id;
    const entry = getPositionFromGlobalIndex(getHomeEntryGlobalIndex('blue'));
    const marbles = placeMarble(state.marbles, blueId, entry);
    const actions = generateLegalActions({ ...state, marbles }, [makeCard('5')]);
    const blueMove = actions.find((a) => a.type === 'move' && a.marbleId === blueId);
    expect(blueMove?.targetPosition?.type).not.toBe('home');
  });

  it('Jack offers swap between two active track marbles (any colors)', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const blackId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const blueId = state.marbles.find((m) => m.color === 'blue' && m.position.type === 'base')!.id;
    let marbles = placeMarble(state.marbles, blackId, { color: 'black', type: 'track', index: 1 });
    marbles = placeMarble(marbles, blueId, { color: 'blue', type: 'track', index: 8 });
    const actions = generateLegalActions({ ...state, marbles }, [makeCard('J')]);
    expect(
      actions.some(
        (a) =>
          a.type === 'swap' &&
          ((a.swapMarbleId1 === blackId && a.swapMarbleId2 === blueId) ||
            (a.swapMarbleId1 === blueId && a.swapMarbleId2 === blackId))
      )
    ).toBe(true);
  });

  it('Queen burn illegal when next player has no cards', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const actions = generateLegalActions(state, [makeCard('Q')]);
    expect(actions.some((a) => a.type === 'burn_next_player')).toBe(false);
    expect(actions[0]?.type).toBe('burn_all_cards');
  });

  it('bring-out eats opponent on start when not locked on own gate', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
      turnNumber: 1,
    });
    const hand = [makeCard('A')];
    const gate = getStartGatePosition('black');
    const bringId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const victimId = state.marbles.find((m) => m.color === 'blue' && m.position.type === 'base')!.id;
    const marbles = placeMarble(state.marbles, victimId, gate);

    const result = applyAction(
      { ...state, marbles },
      {
        type: 'bring_out',
        playerId: 'p1',
        cardId: hand[0].id,
        marbleId: bringId,
        targetPosition: gate,
      },
      hand
    );
    expect(result.state.marbles.find((m) => m.id === bringId)?.position).toEqual(gate);
    expect(result.state.marbles.find((m) => m.id === victimId)?.position.type).toBe('base');
  });

  it('landing on own active track marble captures to base', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
      turnNumber: 1,
    });
    const hand = [makeCard('3')];
    const moverId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const ownId = state.marbles.find(
      (m) => m.color === 'black' && m.position.type === 'base' && m.id !== moverId
    )!.id;
    let marbles = placeMarble(state.marbles, moverId, { color: 'black', type: 'track', index: 1 });
    marbles = placeMarble(marbles, ownId, { color: 'black', type: 'track', index: 4 });
    const target = { color: 'black' as const, type: 'track' as const, index: 4 };

    const result = applyAction(
      { ...state, marbles },
      {
        type: 'move',
        playerId: 'p1',
        cardId: hand[0].id,
        marbleId: moverId,
        targetPosition: target,
      },
      hand
    );
    expect(result.state.marbles.find((m) => m.id === ownId)?.position.type).toBe('base');
  });
});

describe('Obaida Classic rule audit — split seven', () => {
  const p1 = makePlayer('p1', 'black', 0);
  const p2 = makePlayer('p2', 'green', 1, { team: 'B' });
  const p3 = makePlayer('p3', 'blue', 2, { team: 'A' });
  const p4 = makePlayer('p4', 'white', 3, { team: 'B' });

  it('split actions always sum to 7', () => {
    const state = makeBaseState('4p_teams', [p1, p2, p3, p4], 'p1', {
      handCounts: { p1: 1, p2: 0, p3: 0, p4: 0 },
    });
    const m1 = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const m2 = state.marbles.find(
      (m) => m.color === 'black' && m.position.type === 'base' && m.id !== m1
    )!.id;
    let marbles = placeMarble(state.marbles, m1, { color: 'black', type: 'track', index: 2 });
    marbles = placeMarble(marbles, m2, { color: 'black', type: 'track', index: 10 });
    const actions = generateLegalActions({ ...state, marbles }, [makeCard('7')]).filter(
      (a) => a.type === 'split_seven' && a.splitMoves
    );
    expect(actions.length).toBeGreaterThan(0);
    for (const a of actions) {
      const sum = a.splitMoves!.reduce((s, m) => s + m.steps, 0);
      expect(sum).toBe(7);
    }
  });

  it('split seven does not mix own and teammate marbles in one split', () => {
    const state = makeBaseState('4p_teams', [p1, p2, p3, p4], 'p1', {
      handCounts: { p1: 1, p2: 0, p3: 0, p4: 0 },
    });
    const blackId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const blueId = state.marbles.find((m) => m.color === 'blue' && m.position.type === 'base')!.id;
    let marbles = placeMarble(state.marbles, blackId, { color: 'black', type: 'track', index: 2 });
    marbles = placeMarble(marbles, blueId, { color: 'blue', type: 'track', index: 20 });
    const actions = generateLegalActions({ ...state, marbles }, [makeCard('7')]).filter(
      (a) => a.type === 'split_seven' && a.splitMoves
    );
    for (const a of actions) {
      const colors = new Set(
        a.splitMoves!.map((sm) => marbles.find((m) => m.id === sm.marbleId)?.color)
      );
      expect(colors.size).toBe(1);
      expect(colors.has('black') || colors.has('blue')).toBe(true);
    }
  });
});

describe('Obaida Classic rule audit — hand sync', () => {
  const p1 = makePlayer('p1', 'black', 0);
  const p2 = makePlayer('p2', 'blue', 2);

  it('returns empty legal list while hand not synced (no false burn_all)', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 4, p2: 4 },
    });
    expect(generateLegalActions(state, [])).toEqual([]);
  });
});

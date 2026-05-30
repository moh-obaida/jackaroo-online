import { describe, expect, it } from 'vitest';
import { generateLegalActions } from './legalMoves';
import {
  makeBaseState,
  makeCard,
  makePlayer,
  placeMarble,
} from './testFixtures';
import { getStartGatePosition } from './board';

describe('generateLegalActions — Obaida Classic', () => {
  const p1 = makePlayer('p1', 'black', 0);
  const p2 = makePlayer('p2', 'blue', 2);

  it('returns empty while hand is not synced (expected cards but empty hand)', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 4, p2: 4 },
    });
    const actions = generateLegalActions(state, []);
    expect(actions).toEqual([]);
  });

  it('Ace can bring out from base', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const hand = [makeCard('A')];
    const actions = generateLegalActions(state, hand);
    expect(actions.some((a) => a.type === 'bring_out' && a.cardId === hand[0].id)).toBe(true);
  });

  it('King can bring out from base', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const hand = [makeCard('K')];
    const actions = generateLegalActions(state, hand);
    expect(actions.some((a) => a.type === 'bring_out')).toBe(true);
  });

  it('blocks bring out when own marble locks start gate', () => {
    let state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const gate = getStartGatePosition('black');
    const marbleId = state.marbles.find((m) => m.color === 'black')!.id;
    state = {
      ...state,
      marbles: placeMarble(state.marbles, marbleId, gate),
    };
    const hand = [makeCard('A'), makeCard('K')];
    const actions = generateLegalActions(state, hand);
    expect(actions.some((a) => a.type === 'bring_out')).toBe(false);
    expect(actions.some((a) => a.type === 'burn_all_cards')).toBe(true);
  });

  it('Queen burn when next player has cards', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 3 },
    });
    const hand = [makeCard('Q')];
    const actions = generateLegalActions(state, hand);
    expect(actions.some((a) => a.type === 'burn_next_player')).toBe(true);
  });

  it('Jack generates swap pairs for active track marbles', () => {
    let state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const black = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!;
    const blue = state.marbles.find((m) => m.color === 'blue' && m.position.type === 'base')!;
    state = {
      ...state,
      marbles: placeMarble(
        placeMarble(state.marbles, black.id, { color: 'black', type: 'track', index: 2 }),
        blue.id,
        { color: 'blue', type: 'track', index: 5 }
      ),
    };
    const hand = [makeCard('J')];
    const actions = generateLegalActions(state, hand);
    expect(actions.some((a) => a.type === 'swap')).toBe(true);
  });

  it('Five can move eligible opponent marble when no own moves', () => {
    let state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const blue = state.marbles.find((m) => m.color === 'blue' && m.position.type === 'base')!;
    state = {
      ...state,
      marbles: placeMarble(state.marbles, blue.id, { color: 'blue', type: 'track', index: 0 }),
    };
    const hand = [makeCard('5')];
    const actions = generateLegalActions(state, hand);
    expect(actions.some((a) => a.type === 'move' && a.marbleId === blue.id)).toBe(true);
  });

  it('Four backward move on main track', () => {
    let state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const black = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!;
    state = {
      ...state,
      marbles: placeMarble(state.marbles, black.id, { color: 'black', type: 'track', index: 6 }),
    };
    const hand = [makeCard('4')];
    const actions = generateLegalActions(state, hand);
    expect(actions.some((a) => a.type === 'move_backward')).toBe(true);
  });

  it('burn_all when all marbles in base and no Ace/King', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 3, p2: 0 },
    });
    const hand = [makeCard('2'), makeCard('3'), makeCard('4')];
    const actions = generateLegalActions(state, hand);
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('burn_all_cards');
  });

  it('3-player mode has no marbles for inactive fourth color', () => {
    const p1 = makePlayer('p1', 'black', 0, { team: null });
    const p2 = makePlayer('p2', 'green', 1, { team: null });
    const p3 = makePlayer('p3', 'blue', 2, { team: null });
    const state = makeBaseState('3p_solo', [p1, p2, p3], 'p1');
    expect(state.marbles.some((m) => m.color === 'white')).toBe(false);
    expect(state.marbles).toHaveLength(12);
  });

  it('finished team player can bring out teammate marble with Ace', () => {
    const p1 = makePlayer('p1', 'black', 0, { team: 'A' });
    const p2 = makePlayer('p2', 'green', 1, { team: 'B' });
    const p3 = makePlayer('p3', 'blue', 2, { team: 'A' });
    const p4 = makePlayer('p4', 'white', 3, { team: 'B' });
    let state = makeBaseState('4p_teams', [p1, p2, p3, p4], 'p1', {
      handCounts: { p1: 1, p2: 0, p3: 0, p4: 0 },
    });
    state = {
      ...state,
      marbles: state.marbles.map((m) =>
        m.color === 'black'
          ? {
              ...m,
              isFinished: true,
              position: { color: 'black', type: 'home', index: 3 },
            }
          : m
      ),
    };
    const hand = [makeCard('A')];
    const actions = generateLegalActions(state, hand);
    const bringOut = actions.find((a) => a.type === 'bring_out');
    expect(bringOut).toBeDefined();
    const marble = state.marbles.find((m) => m.id === bringOut!.marbleId);
    expect(marble?.color).toBe('blue');
  });
});

import { describe, expect, it } from 'vitest';
import { validateAction } from './validators';
import { makeBaseState, makeCard, makePlayer, placeMarble } from './testFixtures';

describe('validateAction — stale and ownership guards', () => {
  const p1 = makePlayer('p1', 'black', 0);
  const p2 = makePlayer('p2', 'blue', 2);

  it('rejects action when not player turn', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p2', {
      handCounts: { p1: 1, p2: 1 },
    });
    const hand = [makeCard('A')];
    const result = validateAction(state, {
      type: 'burn_all_cards',
      playerId: 'p1',
    }, hand);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/turn/i);
  });

  it('rejects card not in hand', () => {
    let state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const marbleId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    state = {
      ...state,
      marbles: placeMarble(state.marbles, marbleId, { color: 'black', type: 'track', index: 2 }),
    };
    const hand = [makeCard('3')];
    const result = validateAction(state, {
      type: 'move',
      playerId: 'p1',
      cardId: makeCard('5').id,
      marbleId,
      targetPosition: { color: 'black', type: 'track', index: 7 },
    }, hand);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not in hand/i);
  });

  it('accepts burn_all when engine says no legal moves', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 2, p2: 0 },
    });
    const hand = [makeCard('2'), makeCard('3')];
    const result = validateAction(state, {
      type: 'burn_all_cards',
      playerId: 'p1',
    }, hand);
    expect(result.valid).toBe(true);
  });
});

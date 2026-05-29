import { describe, expect, it } from 'vitest';
import {
  STALE_MOVE_ERROR,
  canCommitMoveTransaction,
  validateMovePreconditions,
} from './compareAndSet';
import { makeBaseState, makeCard, makePlayer } from './testFixtures';

describe('validateMovePreconditions', () => {
  const p1 = makePlayer('p1', 'black', 0);
  const p2 = makePlayer('p2', 'blue', 2);

  it('rejects stale turnNumber', () => {
    const authoritative = makeBaseState('2p_solo', [p1, p2], 'p1', {
      turnNumber: 5,
      handCounts: { p1: 1, p2: 0 },
    });
    const client = makeBaseState('2p_solo', [p1, p2], 'p1', {
      turnNumber: 4,
      handCounts: { p1: 1, p2: 0 },
    });
    const result = validateMovePreconditions({
      authoritativeState: authoritative,
      clientState: client,
      action: { type: 'burn_all_cards', playerId: 'p1' },
      hand: [makeCard('2')],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stale).toBe(true);
      expect(result.error).toBe(STALE_MOVE_ERROR);
    }
  });

  it('rejects wrong player', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p2', {
      turnNumber: 2,
      handCounts: { p1: 0, p2: 1 },
    });
    const result = validateMovePreconditions({
      authoritativeState: state,
      clientState: state,
      action: { type: 'burn_all_cards', playerId: 'p1' },
      hand: [makeCard('2')],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/turn/i);
      expect(result.stale).toBe(true);
    }
  });

  it('rejects card missing from hand', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const result = validateMovePreconditions({
      authoritativeState: state,
      clientState: state,
      action: {
        type: 'move',
        playerId: 'p1',
        cardId: makeCard('5').id,
        marbleId: 'm1',
        targetPosition: { color: 'black', type: 'track', index: 3 },
      },
      hand: [makeCard('3')],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/not in hand/i);
      expect(result.stale).toBe(true);
    }
  });

  it('accepts matching preconditions', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const result = validateMovePreconditions({
      authoritativeState: state,
      clientState: state,
      action: { type: 'burn_all_cards', playerId: 'p1' },
      hand: [makeCard('2')],
    });
    expect(result.ok).toBe(true);
  });
});

describe('canCommitMoveTransaction', () => {
  const p1 = makePlayer('p1', 'black', 0);
  const p2 = makePlayer('p2', 'blue', 2);

  it('commits when turnNumber increments once', () => {
    const current = makeBaseState('2p_solo', [p1, p2], 'p1', { turnNumber: 3 });
    const next = makeBaseState('2p_solo', [p1, p2], 'p2', { turnNumber: 4 });
    expect(canCommitMoveTransaction(current, 3, 'p1', next)).toBe(true);
  });

  it('rejects when authoritative turn already advanced', () => {
    const current = makeBaseState('2p_solo', [p1, p2], 'p2', { turnNumber: 4 });
    const next = makeBaseState('2p_solo', [p1, p2], 'p2', { turnNumber: 5 });
    expect(canCommitMoveTransaction(current, 3, 'p1', next)).toBe(false);
  });

  it('rejects when new state skips turn increment', () => {
    const current = makeBaseState('2p_solo', [p1, p2], 'p1', { turnNumber: 3 });
    const staleNext = makeBaseState('2p_solo', [p1, p2], 'p2', { turnNumber: 3 });
    expect(canCommitMoveTransaction(current, 3, 'p1', staleNext)).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { explainNoLegalMove } from './explainNoLegalMove';
import { generateLegalActions } from './legalMoves';
import { makeBaseState, makeCard, makePlayer } from './testFixtures';

describe('explainNoLegalMove', () => {
  const p1 = makePlayer('p1', 'black', 0, { team: 'A' });
  const p2 = makePlayer('p2', 'green', 1, { team: 'B' });
  const p3 = makePlayer('p3', 'blue', 2, { team: 'A' });
  const p4 = makePlayer('p4', 'white', 3, { team: 'B' });

  it('explains all-in-base without Ace/King', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 2, p2: 0 },
    });
    const hand = [makeCard('2'), makeCard('3')];
    expect(explainNoLegalMove(state, hand)).toBe('game.noLegalReason.allInBaseNoAceKing');
  });

  it('only shows burn_all after real no-legal evaluation', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const hand = [makeCard('2')];
    const actions = generateLegalActions(state, hand);
    expect(actions[0]?.type).toBe('burn_all_cards');
    expect(explainNoLegalMove(state, hand)).toBe('game.noLegalReason.allInBaseNoAceKing');
  });

  it('detects burn unavailable when next player has no cards', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const hand = [makeCard('Q')];
    const actions = generateLegalActions(state, hand);
    expect(actions[0]?.type).toBe('burn_all_cards');
    expect(explainNoLegalMove(state, hand)).toBe('game.noLegalReason.burnUnavailable');
  });

  it('empty hand while expected cards yields generic (loading path uses empty legal list)', () => {
    const state = makeBaseState('4p_teams', [p1, p2, p3, p4], 'p1', {
      handCounts: { p1: 4, p2: 4, p3: 4, p4: 4 },
    });
    expect(generateLegalActions(state, [])).toEqual([]);
    expect(explainNoLegalMove(state, [])).toBe('game.noLegalReason.generic');
  });
});

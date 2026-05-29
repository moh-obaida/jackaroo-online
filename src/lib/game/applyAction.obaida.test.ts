import { describe, expect, it } from 'vitest';
import { applyAction } from './applyAction';
import { makeBaseState, makeCard, makePlayer, placeMarble } from './testFixtures';
import { getStartGatePosition } from './board';

describe('applyAction — Obaida Classic', () => {
  const p1 = makePlayer('p1', 'black', 0);
  const p2 = makePlayer('p2', 'blue', 2);

  it('bring out places marble on start gate and advances turn once', () => {
    const state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
      turnNumber: 3,
    });
    const hand = [makeCard('A')];
    const marbleId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    const gate = getStartGatePosition('black');

    const result = applyAction(
      state,
      {
        type: 'bring_out',
        playerId: 'p1',
        cardId: hand[0].id,
        marbleId,
        targetPosition: gate,
      },
      hand
    );

    const moved = result.state.marbles.find((m) => m.id === marbleId);
    expect(moved?.position).toEqual(gate);
    expect(result.state.currentTurnPlayerId).toBe('p2');
    expect(result.state.turnNumber).toBe(4);
    expect(result.currentPlayerHand).toHaveLength(0);
  });

  it('move removes card from hand and updates handCounts', () => {
    let state = makeBaseState('2p_solo', [p1, p2], 'p1', {
      handCounts: { p1: 1, p2: 0 },
    });
    const marbleId = state.marbles.find((m) => m.color === 'black' && m.position.type === 'base')!.id;
    state = {
      ...state,
      marbles: placeMarble(state.marbles, marbleId, { color: 'black', type: 'track', index: 1 }),
    };
    const hand = [makeCard('3')];
    const target = { color: 'black' as const, type: 'track' as const, index: 4 };

    const result = applyAction(
      state,
      {
        type: 'move',
        playerId: 'p1',
        cardId: hand[0].id,
        marbleId,
        targetPosition: target,
      },
      hand
    );

    expect(result.currentPlayerHand).toHaveLength(0);
    expect(result.state.handCounts.p1).toBe(0);
    expect(result.state.marbles.find((m) => m.id === marbleId)?.position).toEqual(target);
  });
});

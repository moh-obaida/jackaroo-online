import { describe, expect, it } from 'vitest';
import { getPlayStep } from '../play/playStep';
import { presentLegalActions } from '../play/presentActions';
import { makeCard } from './testFixtures';

describe('getPlayStep — legalMovesReady guard', () => {
  it('shows loading_legal instead of discard_all while hand syncs', () => {
    const hand = [makeCard('2'), makeCard('3')];
    const view = presentLegalActions(
      [{ type: 'burn_all_cards', cardId: '', description: 'Discard all' }],
      null,
      hand
    );
    expect(view.kind).toBe('burn_all');
    expect(getPlayStep(true, view, false, false)).toBe('loading_legal');
    expect(getPlayStep(true, view, true, false)).toBe('discard_all');
  });
});

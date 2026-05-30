import { describe, expect, it } from 'vitest';
import {
  colorForSeat,
  getInactiveColors,
  getNextJoinSeat,
  getSeatSlotsForMode,
} from './seats';
import {
  dealRound,
  getNextStartingSeat,
  initializeDealBlock,
  isDealBlockExhausted,
} from './dealing';
import {
  generate2PlayerDealPattern,
  generate3PlayerDealPatterns,
  generate4PlayerDealPattern,
  createDeck,
} from './cards';
import { makePlayer } from './testFixtures';

describe('seats — Obaida Classic', () => {
  it('2-player uses opposite board seats 0 and 2', () => {
    expect(getSeatSlotsForMode('2p_solo')).toEqual([0, 2]);
    expect(getNextJoinSeat('2p_solo', [])).toBe(0);
    expect(getNextJoinSeat('2p_solo', [0])).toBe(2);
    expect(getNextJoinSeat('2p_solo', [0, 2])).toBeNull();
    expect(colorForSeat(0)).toBe('black');
    expect(colorForSeat(2)).toBe('blue');
  });

  it('3-player uses seats 0–2 and leaves one color inactive', () => {
    expect(getSeatSlotsForMode('3p_solo')).toEqual([0, 1, 2]);
    const active = ['black', 'green', 'blue'] as const;
    expect(getInactiveColors([...active])).toEqual(['white']);
  });
});

describe('dealing — 4-player block', () => {
  it('uses three rounds summing to 52 cards', () => {
    const pattern = generate4PlayerDealPattern();
    expect(pattern).toHaveLength(3);
    expect(pattern.filter((n) => n === 5)).toHaveLength(1);
    expect(pattern.reduce((a, b) => a + b, 0) * 4).toBe(52);
  });

  it('dealRound distributes pattern across four players', () => {
    const players = [
      makePlayer('p0', 'black', 0),
      makePlayer('p1', 'green', 1),
      makePlayer('p2', 'blue', 2),
      makePlayer('p3', 'white', 3),
    ];
    const deck = createDeck();
    const pattern = [4, 5, 4];
    let remaining = deck;
    let totalDealt = 0;
    for (let round = 0; round < 3; round++) {
      const { hands, remainingDeck } = dealRound(remaining, players, '4p_teams', pattern, round);
      const roundTotal = Object.values(hands).reduce((n, h) => n + h.length, 0);
      totalDealt += roundTotal;
      expect(roundTotal).toBe(pattern[round] * 4);
      remaining = remainingDeck;
    }
    expect(totalDealt).toBe(52);
    expect(remaining).toHaveLength(0);
  });

  it('exhausts block after 3 rounds', () => {
    expect(isDealBlockExhausted('4p_teams', 3)).toBe(true);
    expect(isDealBlockExhausted('4p_teams', 2)).toBe(false);
  });
});

describe('dealing — 2-player cycle', () => {
  it('uses 4-4-5 pattern for 26 cards per cycle', () => {
    expect(generate2PlayerDealPattern()).toEqual([4, 4, 5]);
  });

  it('dealRound uses 26 cards across two players', () => {
    const players = [makePlayer('p0', 'black', 0), makePlayer('p1', 'blue', 2)];
    const deck = createDeck();
    const pattern = generate2PlayerDealPattern();
    let remaining = deck;
    let total = 0;
    for (let round = 0; round < 3; round++) {
      const { hands, remainingDeck } = dealRound(remaining, players, '2p_solo', pattern, round);
      total += Object.values(hands).reduce((n, h) => n + h.length, 0);
      remaining = remainingDeck;
    }
    expect(total).toBe(26);
    expect(remaining).toHaveLength(26);
  });
});

describe('dealing — 3-player rotation', () => {
  it('uses four deals of 13 cards (52 total)', () => {
    const pattern = generate3PlayerDealPatterns();
    expect(pattern).toHaveLength(4);
    for (const round of pattern) {
      expect(round.reduce((a, b) => a + b, 0)).toBe(13);
    }
    const total = pattern.reduce((sum, round) => sum + round.reduce((a, b) => a + b, 0), 0);
    expect(total).toBe(52);
  });

  it('exhausts block after 4 rounds', () => {
    expect(isDealBlockExhausted('3p_solo', 4)).toBe(true);
  });
});

describe('dealing — starting seat rotation', () => {
  it('rotates starting seat after each block', () => {
    expect(getNextStartingSeat(0, 4)).toBe(1);
    expect(getNextStartingSeat(3, 4)).toBe(0);
    expect(getNextStartingSeat(1, 2)).toBe(0);
  });

  it('initializeDealBlock returns shuffled deck and pattern', () => {
    const block = initializeDealBlock('4p_teams', 0);
    expect(block.deck).toHaveLength(52);
    expect(block.startingSeat).toBe(0);
    expect(block.dealPattern).toHaveLength(3);
  });
});

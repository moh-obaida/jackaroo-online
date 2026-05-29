import { CardRank } from '../../types/game';

export type CardFaceVariant = 'hand' | 'standard' | 'guide';
export type CardFaceTone = 'red' | 'blue' | 'black';

export type CardFaceSegment = {
  key: string;
  tone?: CardFaceTone;
};

export type CardFaceMeta = {
  cornerRank: string;
  cornerNumeric?: string;
  faceLabelKey?: string;
  centerValue: string;
  centerTopKey?: string;
  centerTopTone?: CardFaceTone;
  centerBottomKey?: string;
  centerBottomTone?: CardFaceTone;
  ruleLines: CardFaceSegment[][];
};

/** Hand dock uses rank letter; guide/full uses physical-style center values. */
export function getCardCenterValue(rank: CardRank, variant: CardFaceVariant): string {
  if (variant === 'hand') {
    return rank === '10' ? '10' : rank;
  }
  switch (rank) {
    case 'A':
      return '1|11';
    case 'K':
      return '13';
    case 'Q':
      return '12';
    case 'J':
      return '11';
    case '10':
      return '10';
    default:
      return rank;
  }
}

export function getCardCornerNumeric(rank: CardRank): string | undefined {
  switch (rank) {
    case 'A':
      return '1|11';
    case 'K':
      return '13';
    case 'Q':
      return '12';
    case 'J':
      return '11';
    case '10':
      return '10';
    default:
      return rank;
  }
}

export function getCardFaceLabelKey(rank: CardRank): string | undefined {
  if (rank === 'A' || rank === 'J' || rank === 'Q' || rank === 'K') {
    return `cardFace.${rank}.faceLabel`;
  }
  return undefined;
}

const RULE_PREFIX = 'cardFace';

function line(rank: CardRank, n: number, parts: CardFaceSegment[]): CardFaceSegment[] {
  return parts.map((p, i) => ({
    ...p,
    key: p.key.startsWith('cardFace.') ? p.key : `${RULE_PREFIX}.${rank}.l${n}.s${i}`,
  }));
}

/** Segment tone + placeholder keys; translations live in i18n. */
export const CARD_FACE_META: Record<CardRank, CardFaceMeta> = {
  A: {
    cornerRank: 'A',
    cornerNumeric: '1|11',
    faceLabelKey: 'cardFace.A.faceLabel',
    centerValue: '1|11',
    centerTopKey: 'cardFace.A.centerTop',
    centerTopTone: 'red',
    centerBottomKey: 'cardFace.A.centerBottom',
    centerBottomTone: 'red',
    ruleLines: [
      line('A', 1, [
        { key: `${RULE_PREFIX}.A.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.A.l1.s1` },
        { key: `${RULE_PREFIX}.A.l1.s2`, tone: 'red' },
        { key: `${RULE_PREFIX}.A.l1.s3` },
      ]),
    ],
  },
  '2': {
    cornerRank: '2',
    centerValue: '2',
    centerTopKey: 'cardFace.2.centerTop',
    centerTopTone: 'red',
    ruleLines: [
      line('2', 1, [
        { key: `${RULE_PREFIX}.2.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.2.l1.s1` },
      ]),
    ],
  },
  '3': {
    cornerRank: '3',
    centerValue: '3',
    centerTopKey: 'cardFace.3.centerTop',
    centerTopTone: 'red',
    ruleLines: [
      line('3', 1, [
        { key: `${RULE_PREFIX}.3.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.3.l1.s1` },
      ]),
    ],
  },
  '4': {
    cornerRank: '4',
    centerValue: '4',
    centerTopKey: 'cardFace.4.centerTop',
    centerTopTone: 'red',
    ruleLines: [
      line('4', 1, [
        { key: `${RULE_PREFIX}.4.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.4.l1.s1` },
      ]),
    ],
  },
  '5': {
    cornerRank: '5',
    centerValue: '5',
    centerTopKey: 'cardFace.5.centerTop',
    centerTopTone: 'red',
    centerBottomKey: 'cardFace.5.centerBottom',
    centerBottomTone: 'blue',
    ruleLines: [
      line('5', 1, [
        { key: `${RULE_PREFIX}.5.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.5.l1.s1` },
        { key: `${RULE_PREFIX}.5.l1.s2`, tone: 'blue' },
        { key: `${RULE_PREFIX}.5.l1.s3` },
      ]),
    ],
  },
  '6': {
    cornerRank: '6',
    centerValue: '6',
    centerTopKey: 'cardFace.6.centerTop',
    centerTopTone: 'red',
    ruleLines: [
      line('6', 1, [
        { key: `${RULE_PREFIX}.6.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.6.l1.s1` },
      ]),
    ],
  },
  '7': {
    cornerRank: '7',
    centerValue: '7',
    centerTopKey: 'cardFace.7.centerTop',
    centerTopTone: 'red',
    centerBottomKey: 'cardFace.7.centerBottom',
    centerBottomTone: 'red',
    ruleLines: [
      line('7', 1, [
        { key: `${RULE_PREFIX}.7.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.7.l1.s1` },
        { key: `${RULE_PREFIX}.7.l1.s2`, tone: 'red' },
        { key: `${RULE_PREFIX}.7.l1.s3` },
      ]),
    ],
  },
  '8': {
    cornerRank: '8',
    centerValue: '8',
    centerTopKey: 'cardFace.8.centerTop',
    centerTopTone: 'red',
    ruleLines: [
      line('8', 1, [
        { key: `${RULE_PREFIX}.8.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.8.l1.s1` },
      ]),
    ],
  },
  '9': {
    cornerRank: '9',
    centerValue: '9',
    centerTopKey: 'cardFace.9.centerTop',
    centerTopTone: 'red',
    ruleLines: [
      line('9', 1, [
        { key: `${RULE_PREFIX}.9.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.9.l1.s1` },
      ]),
    ],
  },
  '10': {
    cornerRank: '10',
    cornerNumeric: '10',
    centerValue: '10',
    centerTopKey: 'cardFace.10.centerTop',
    centerTopTone: 'red',
    centerBottomKey: 'cardFace.10.centerBottom',
    centerBottomTone: 'blue',
    ruleLines: [
      line('10', 1, [
        { key: `${RULE_PREFIX}.10.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.10.l1.s1` },
        { key: `${RULE_PREFIX}.10.l1.s2`, tone: 'blue' },
        { key: `${RULE_PREFIX}.10.l1.s3` },
      ]),
    ],
  },
  J: {
    cornerRank: 'J',
    cornerNumeric: '11',
    faceLabelKey: 'cardFace.J.faceLabel',
    centerValue: '11',
    centerTopKey: 'cardFace.J.centerTop',
    centerTopTone: 'red',
    ruleLines: [
      line('J', 1, [
        { key: `${RULE_PREFIX}.J.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.J.l1.s1` },
      ]),
    ],
  },
  Q: {
    cornerRank: 'Q',
    cornerNumeric: '12',
    faceLabelKey: 'cardFace.Q.faceLabel',
    centerValue: '12',
    centerTopKey: 'cardFace.Q.centerTop',
    centerTopTone: 'red',
    centerBottomKey: 'cardFace.Q.centerBottom',
    centerBottomTone: 'blue',
    ruleLines: [
      line('Q', 1, [
        { key: `${RULE_PREFIX}.Q.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.Q.l1.s1` },
        { key: `${RULE_PREFIX}.Q.l1.s2`, tone: 'blue' },
        { key: `${RULE_PREFIX}.Q.l1.s3` },
      ]),
    ],
  },
  K: {
    cornerRank: 'K',
    cornerNumeric: '13',
    faceLabelKey: 'cardFace.K.faceLabel',
    centerValue: '13',
    centerTopKey: 'cardFace.K.centerTop',
    centerTopTone: 'red',
    centerBottomKey: 'cardFace.K.centerBottom',
    centerBottomTone: 'blue',
    ruleLines: [
      line('K', 1, [
        { key: `${RULE_PREFIX}.K.l1.s0`, tone: 'red' },
        { key: `${RULE_PREFIX}.K.l1.s1` },
        { key: `${RULE_PREFIX}.K.l1.s2`, tone: 'blue' },
        { key: `${RULE_PREFIX}.K.l1.s3` },
      ]),
    ],
  },
};

export function getCardFaceMeta(rank: CardRank): CardFaceMeta {
  return CARD_FACE_META[rank];
}

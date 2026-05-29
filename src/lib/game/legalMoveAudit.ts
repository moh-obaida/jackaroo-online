import { Card, GameState, LegalAction } from '../../types/game';
import { generateLegalActions } from './legalMoves';
import { explainNoLegalMove } from './explainNoLegalMove';

export type LegalMoveAuditReport = {
  roomCode?: string;
  mode: GameState['mode'];
  currentPlayerId: string;
  currentPlayerName: string;
  selectedCardId: string | null;
  hand: Card[];
  marbleSummary: Array<{ id: string; color: string; position: string; finished: boolean }>;
  allGeneratedActions: LegalAction[];
  prioritizedActions: LegalAction[];
  noLegalReasonKey: string | null;
  perCard: Array<{
    cardId: string;
    rank: string;
    actionCount: number;
    actionTypes: string[];
  }>;
};

function marbleLine(state: GameState) {
  return state.marbles.map((m) => ({
    id: m.id,
    color: m.color,
    position: `${m.position.type}:${m.position.color}:${m.position.index}`,
    finished: m.isFinished,
  }));
}

function auditPerCard(state: GameState, hand: Card[]): LegalMoveAuditReport['perCard'] {
  return hand.map((card) => {
    const subset = generateLegalActions(state, [card]);
    return {
      cardId: card.id,
      rank: card.rank,
      actionCount: subset.length,
      actionTypes: subset.map((a) => a.type),
    };
  });
}

/** Dev-only: log legal move diagnostics to the console. */
export function logLegalMoveAudit(
  state: GameState,
  hand: Card[],
  selectedCardId: string | null,
  roomCode?: string
): LegalMoveAuditReport {
  const player = state.players.find((p) => p.id === state.currentTurnPlayerId);
  const prioritized = generateLegalActions(state, hand);

  const report: LegalMoveAuditReport = {
    roomCode,
    mode: state.mode,
    currentPlayerId: state.currentTurnPlayerId,
    currentPlayerName: player?.name ?? '—',
    selectedCardId,
    hand: hand.map((c) => ({ ...c })),
    marbleSummary: marbleLine(state),
    allGeneratedActions: prioritized,
    prioritizedActions: prioritized,
    noLegalReasonKey:
      prioritized.length === 1 && prioritized[0].type === 'burn_all_cards'
        ? explainNoLegalMove(state, hand)
        : null,
    perCard: auditPerCard(state, hand),
  };

  console.groupCollapsed(
    `[Jakaroo legal audit] ${roomCode ?? 'room'} · ${report.currentPlayerName} · turn ${state.currentTurnPlayerId}`
  );
  console.table(report.marbleSummary);
  console.table(report.perCard);
  console.log('prioritized actions', report.prioritizedActions);
  if (report.noLegalReasonKey) {
    console.log('no-legal reason key', report.noLegalReasonKey);
  }
  console.groupEnd();

  return report;
}

export function isLegalMoveAuditEnabled(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_LEGAL_AUDIT !== '0';
}

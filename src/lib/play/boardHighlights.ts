import { BoardPosition, LegalAction } from '../../types/game';

export function positionKey(pos: BoardPosition): string {
  return `${pos.color}:${pos.type}:${pos.index}`;
}

/** UI-only: landing spots for the selected card (Manus §16 — legal move highlights). */
export function getHighlightPositionsForCard(
  legalActions: LegalAction[],
  selectedCardId: string | null
): BoardPosition[] {
  if (!selectedCardId) return [];

  const seen = new Set<string>();
  const out: BoardPosition[] = [];

  for (const action of legalActions) {
    if (action.cardId !== selectedCardId || !action.targetPosition) continue;
    const key = positionKey(action.targetPosition);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(action.targetPosition);
  }

  return out;
}

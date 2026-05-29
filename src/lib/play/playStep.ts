import { PlayPresentation } from './presentActions';

/** Uno/Ludo-style guided steps — UI only. */
export type PlayStepId =
  | 'wait'
  | 'loading_legal'
  | 'submitting'
  | 'select_card'
  | 'choose_action'
  | 'discard_all'
  | 'skip_turn';

export function getPlayStep(
  isMyTurn: boolean,
  view: PlayPresentation,
  legalMovesReady: boolean,
  isSubmitting = false
): PlayStepId {
  if (!isMyTurn) return 'wait';
  if (isSubmitting) return 'submitting';
  if (!legalMovesReady) return 'loading_legal';
  switch (view.kind) {
    case 'skip':
      return 'skip_turn';
    case 'burn_all':
      return 'discard_all';
    case 'pick_card':
      return 'select_card';
    case 'play_card':
      return 'choose_action';
    default:
      return 'select_card';
  }
}

export function playStepI18nKey(step: PlayStepId): string {
  return `game.step.${step}`;
}

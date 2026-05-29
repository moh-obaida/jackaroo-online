import { describe, expect, it } from 'vitest';
import { STALE_MOVE_ERROR } from './compareAndSet';

describe('double submit guard', () => {
  it('blocks concurrent submit when submittingRef is set', () => {
    let submittingRef = false;

    const trySubmit = (): { ok: true } | { ok: false; error: string } => {
      if (submittingRef) {
        return { ok: false, error: STALE_MOVE_ERROR };
      }
      submittingRef = true;
      return { ok: true };
    };

    expect(trySubmit()).toEqual({ ok: true });
    expect(trySubmit()).toEqual({ ok: false, error: STALE_MOVE_ERROR });
  });
});

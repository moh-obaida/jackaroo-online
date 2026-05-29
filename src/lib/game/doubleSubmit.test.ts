import { describe, expect, it } from 'vitest';
import {
  STALE_MOVE_ERROR,
  acquireSubmitLock,
  rejectIfSubmitInFlight,
  releaseSubmitLock,
} from './compareAndSet';

describe('double submit guard', () => {
  it('documents double submit guard pattern', () => {
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

  it('rejectIfSubmitInFlight matches GamePlayContext.submitAction guard', () => {
    const lock = { current: false };

    expect(rejectIfSubmitInFlight(lock)).toBeNull();
    expect(acquireSubmitLock(lock)).toBe(true);
    expect(rejectIfSubmitInFlight(lock)).toEqual({ ok: false, error: STALE_MOVE_ERROR });
    expect(acquireSubmitLock(lock)).toBe(false);

    releaseSubmitLock(lock);
    expect(rejectIfSubmitInFlight(lock)).toBeNull();
  });
});

// Pure account-lockout decisions, pulled out of auth.ts's Credentials
// authorize() so the threshold/expiry math is directly unit-testable
// without a DB or a real sign-in attempt.

export function isLockedOut(
  lockedUntil: Date | null,
  now: Date = new Date()
): boolean {
  return lockedUntil !== null && lockedUntil > now;
}

// Returns the new lockedUntil to persist after a failed attempt —
// null clears any existing lock (called when the post-increment count
// is still under threshold, so a previously-expired lock isn't kept
// alive by a single new failure).
export function nextLockedUntil(
  failedAttemptsAfterIncrement: number,
  threshold: number,
  lockoutDurationMs: number,
  now: Date = new Date()
): Date | null {
  return failedAttemptsAfterIncrement >= threshold
    ? new Date(now.getTime() + lockoutDurationMs)
    : null;
}

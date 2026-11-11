const WINDOW_MS = 60_000;

/** Per-token sliding-window limits on tool calls, kept in this process. */
export const RATE_LIMITS = { call: 120, change: 30 } as const;

const history = new Map<string, number[]>();
let lastSweep = 0;

/** Drops keys with no calls inside the window, at most once a window, so idle tokens do not accumulate. */
function sweep(now: number): void {
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [key, times] of history) {
    if (!times.some((time) => now - time < WINDOW_MS)) history.delete(key);
  }
}

/** The number of tokens and kinds currently tracked; for tests. */
export function trackedRateLimitKeys(): number {
  return history.size;
}

/** Records a call and returns a message if it exceeds the limit for its kind, or undefined if it is allowed. */
export function takeRateLimit(tokenId: string, kind: keyof typeof RATE_LIMITS, now = Date.now()): string | undefined {
  sweep(now);
  const key = `${tokenId}:${kind}`;
  const recent = (history.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= RATE_LIMITS[kind]) {
    history.set(key, recent);
    return `Rate limit reached: at most ${RATE_LIMITS[kind]} ${kind === 'call' ? 'tool calls' : 'writes and deletes'} per minute. Try again shortly.`;
  }
  recent.push(now);
  history.set(key, recent);
  return undefined;
}

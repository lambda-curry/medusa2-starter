const WINDOW_MS = 60_000;

/** Per-token sliding-window limits on tool calls, kept in this process. */
export const RATE_LIMITS = { call: 120, change: 30 } as const;

const history = new Map<string, number[]>();

/** Records a call and returns a message if it exceeds the limit for its kind, or undefined if it is allowed. */
export function takeRateLimit(tokenId: string, kind: keyof typeof RATE_LIMITS, now = Date.now()): string | undefined {
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

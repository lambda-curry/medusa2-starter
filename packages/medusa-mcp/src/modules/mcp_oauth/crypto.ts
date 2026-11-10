import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** RFC 7636: 43 to 128 characters from the unreserved set. */
export function isValidCodeVerifier(verifier: unknown): verifier is string {
  return typeof verifier === 'string' && /^[A-Za-z0-9\-._~]{43,128}$/.test(verifier);
}

/** RFC 7636 S256: BASE64URL(SHA256(code_verifier)) must equal the code_challenge. */
export function verifyPkceS256(verifier: string, challenge: string): boolean {
  const expected = Buffer.from(createHash('sha256').update(verifier).digest('base64url'));
  const actual = Buffer.from(challenge);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Signs a JSON payload with an expiry, for state the authorize pages round-trip through a form. */
export function signPayload(payload: Record<string, unknown>, secret: string, ttlSeconds: number): string {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })).toString(
    'base64url',
  );
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

/** Returns the payload of a token from {@link signPayload}, or undefined if it is forged, malformed, or expired. */
export function verifyPayload<T extends object>(token: unknown, secret: string): T | undefined {
  if (typeof token !== 'string') return undefined;
  const [body, signature, ...rest] = token.split('.');
  if (!body || !signature || rest.length) return undefined;

  const expected = Buffer.from(createHmac('sha256', secret).update(body).digest('base64url'));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return undefined;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T & { exp?: number };
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return undefined;
    return payload;
  } catch {
    return undefined;
  }
}

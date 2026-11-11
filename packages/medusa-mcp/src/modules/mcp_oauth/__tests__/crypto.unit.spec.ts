import { isValidCodeVerifier, signPayload, verifyPayload, verifyPkceS256 } from '../crypto';
import { parseScopes } from '../service';

describe('PKCE S256', () => {
  // RFC 7636 Appendix B.
  const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
  const challenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

  it('matches the RFC 7636 test vector and nothing else', () => {
    expect(verifyPkceS256(verifier, challenge)).toBe(true);
    expect(verifyPkceS256(`${verifier}x`, challenge)).toBe(false);
    expect(verifyPkceS256(verifier, challenge.slice(1))).toBe(false);
  });

  it('accepts only 43 to 128 unreserved characters as a verifier', () => {
    expect(isValidCodeVerifier(verifier)).toBe(true);
    expect(isValidCodeVerifier('a'.repeat(42))).toBe(false);
    expect(isValidCodeVerifier('a'.repeat(129))).toBe(false);
    expect(isValidCodeVerifier(`${'a'.repeat(43)}/`)).toBe(false);
    expect(isValidCodeVerifier(undefined)).toBe(false);
  });
});

describe('signed form payloads', () => {
  const secret = 'test-secret';

  it('round-trips a payload', () => {
    expect(verifyPayload('consent', signPayload('consent', { user_id: 'user_1' }, secret, 60), secret)).toMatchObject({
      user_id: 'user_1',
    });
  });

  it('refuses a token signed for a different form', () => {
    const login = signPayload('login', { request: {} }, secret, 60);
    expect(verifyPayload('login', login, secret)).toBeDefined();
    expect(verifyPayload('consent', login, secret)).toBeUndefined();
  });

  it('rejects a changed payload, a different secret, and an expired token', () => {
    const token = signPayload('consent', { user_id: 'user_1' }, secret, 60);
    const [body, signature] = token.split('.');
    const changed = Buffer.from(Buffer.from(body, 'base64url').toString().replace('user_1', 'user_2')).toString(
      'base64url',
    );
    expect(verifyPayload('consent', `${changed}.${signature}`, secret)).toBeUndefined();
    expect(verifyPayload('consent', token, 'other-secret')).toBeUndefined();
    expect(verifyPayload('consent', signPayload('consent', { user_id: 'user_1' }, secret, -1), secret)).toBeUndefined();
    expect(verifyPayload('consent', 'not.a.token', secret)).toBeUndefined();
    expect(verifyPayload('consent', undefined, secret)).toBeUndefined();
  });
});

describe('parseScopes', () => {
  it('grants every scope when none is requested and orders known scopes', () => {
    expect(parseScopes(undefined)).toEqual(['mcp:read', 'mcp:write', 'mcp:delete']);
    expect(parseScopes('')).toEqual(['mcp:read', 'mcp:write', 'mcp:delete']);
    expect(parseScopes('mcp:delete  mcp:read mcp:read')).toEqual(['mcp:read', 'mcp:delete']);
  });

  it('rejects unknown scopes', () => {
    expect(parseScopes('mcp:read openid')).toBeUndefined();
    expect(parseScopes(['mcp:read'])).toBeUndefined();
  });
});

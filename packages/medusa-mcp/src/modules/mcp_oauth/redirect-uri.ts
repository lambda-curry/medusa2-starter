import { isLoopbackHost } from './config';

const MAX_REDIRECT_URIS = 10;
const MAX_URI_LENGTH = 2048;

/** Why a redirect URI is unacceptable, or undefined when it is acceptable: HTTPS, or HTTP to a loopback host. */
export function redirectUriProblem(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return 'redirect URI must be a non-empty string';
  if (value.length > MAX_URI_LENGTH) return `redirect URI is longer than ${MAX_URI_LENGTH} characters`;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return `redirect URI is not an absolute URL: ${value}`;
  }
  if (url.hash || value.includes('#')) return `redirect URI must not contain a fragment: ${value}`;
  if (url.username || url.password) return `redirect URI must not contain credentials: ${value}`;
  if (url.protocol === 'https:') return undefined;
  if (url.protocol === 'http:' && isLoopbackHost(url.hostname)) return undefined;
  return `redirect URI must use https, or http to localhost: ${value}`;
}

/** Validates a client's redirect URI list, returning the problems found. */
export function redirectUrisProblems(value: unknown): string[] {
  if (!Array.isArray(value) || !value.length) return ['redirect_uris must be a non-empty array'];
  if (value.length > MAX_REDIRECT_URIS) return [`redirect_uris may list at most ${MAX_REDIRECT_URIS} URIs`];
  return value.map(redirectUriProblem).filter((problem): problem is string => Boolean(problem));
}

/**
 * Whether a requested redirect URI matches a registered one: exactly, or for an HTTP loopback callback, exactly except
 * for the port. Native clients listen on whatever port is free, so RFC 8252 section 7.3 requires accepting any port.
 */
export function redirectUriMatches(registered: string, requested: string): boolean {
  if (registered === requested) return true;
  let registeredHost: string;
  try {
    const url = new URL(registered);
    if (url.protocol !== 'http:' || !isLoopbackHost(url.hostname)) return false;
    registeredHost = url.hostname;
  } catch {
    return false;
  }
  // Compare the URIs as written, not as parsed: parsing would normalize dot segments and strip characters.
  const withoutPort = (uri: string) => {
    const match = /^http:\/\/(\[[^\]]+\]|[^/?#:[\]]+)(?::\d+)?([/?#].*)?$/s.exec(uri);
    return match && { host: match[1], rest: match[2] ?? '' };
  };
  const a = withoutPort(registered);
  const b = withoutPort(requested);
  return Boolean(a && b && a.host === b.host && a.host === registeredHost && a.rest === b.rest);
}

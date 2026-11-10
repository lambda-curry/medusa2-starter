import { lookup as dnsLookup, type LookupAddress } from 'node:dns';
import { request } from 'node:https';
import { BlockList, isIP } from 'node:net';
import { redirectUrisProblems } from './redirect-uri';

const MAX_DOCUMENT_BYTES = 64 * 1024;
const FETCH_TIMEOUT_MS = 5000;

/** Addresses a Client ID Metadata Document fetch must never connect to. BlockList also checks IPv4-mapped IPv6
 * addresses such as ::ffff:127.0.0.1 against the IPv4 subnets, so they need no rule of their own. */
const BLOCKED_ADDRESSES = new BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  BLOCKED_ADDRESSES.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  BLOCKED_ADDRESSES.addSubnet(network, prefix, 'ipv6');
}

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (!family) return false;
  return !BLOCKED_ADDRESSES.check(address, family === 4 ? 'ipv4' : 'ipv6');
}

export interface ClientMetadataDocument {
  client_id: string;
  client_name: string;
  redirect_uris: string[];
  [key: string]: unknown;
}

/** Why a URL cannot be a CIMD client_id, or undefined when it can. */
export function cimdClientIdProblem(clientId: string): string | undefined {
  let url: URL;
  try {
    url = new URL(clientId);
  } catch {
    return 'client_id is not a URL';
  }
  if (url.protocol !== 'https:') return 'a URL client_id must use https';
  if (url.pathname === '/' || !url.pathname) return 'a URL client_id must have a path';
  if (url.username || url.password || url.hash) return 'a URL client_id must not contain credentials or a fragment';
  // Node connects to an IP literal without calling the lookup hook, so publicOnlyLookup cannot guard it.
  if (isIP(url.hostname.replace(/^\[|\]$/g, ''))) return 'a URL client_id must use a domain name, not an IP address';
  return undefined;
}

/** Validates a fetched document against the client_id it was fetched from. */
export function validateClientMetadataDocument(clientId: string, document: unknown): ClientMetadataDocument {
  const problems: string[] = [];
  const doc = (document && typeof document === 'object' ? document : {}) as Record<string, unknown>;

  if (doc.client_id !== clientId) problems.push('client_id in the document does not match the URL it was fetched from');
  if (typeof doc.client_name !== 'string' || !doc.client_name) problems.push('client_name is required');
  problems.push(...redirectUrisProblems(doc.redirect_uris));

  const plural = doc.token_endpoint_auth_methods_supported;
  const singular = doc.token_endpoint_auth_method;
  const methods = Array.isArray(plural) ? plural : typeof singular === 'string' ? [singular] : ['none'];
  if (!methods.includes('none')) problems.push('the client must support token_endpoint_auth_method "none"');

  if (problems.length) throw new Error(`Invalid client metadata document: ${problems.join('; ')}`);
  return doc as ClientMetadataDocument;
}

type LookupCallback = (error: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void;

/** Resolves like dns.lookup but fails if any resolved address is not public, so the socket can only reach public IPs. */
export function publicOnlyLookup(hostname: string, options: object, callback: LookupCallback): void {
  dnsLookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error, []);
    const blocked = addresses.find((entry) => !isPublicAddress(entry.address));
    if (blocked) {
      return callback(
        Object.assign(new Error(`${hostname} resolves to a non-public address`), { code: 'EBLOCKED' }),
        [],
      );
    }
    const wantsAll = (options as { all?: boolean }).all;
    if (wantsAll) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
}

export type FetchJson = (url: string) => Promise<unknown>;

/** Fetches a JSON document over HTTPS from public addresses only, with no redirects, a timeout, and a size cap. */
export const fetchPublicJson: FetchJson = (url) =>
  new Promise((resolve, reject) => {
    const host = new URL(url).hostname.replace(/^\[|\]$/g, '');
    if (isIP(host)) {
      reject(new Error(`GET ${url} refused: IP-literal hosts bypass the public-address check`));
      return;
    }
    const req = request(
      url,
      { method: 'GET', headers: { accept: 'application/json' }, lookup: publicOnlyLookup, timeout: FETCH_TIMEOUT_MS },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`GET ${url} returned HTTP ${res.statusCode}`));
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_DOCUMENT_BYTES) {
            req.destroy(new Error(`GET ${url} returned more than ${MAX_DOCUMENT_BYTES} bytes`));
            return;
          }
          chunks.push(chunk);
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch {
            reject(new Error(`GET ${url} did not return JSON`));
          }
        });
      },
    );
    // `timeout` only bounds idle time between chunks; this bounds the whole request.
    const deadline = setTimeout(
      () => req.destroy(new Error(`GET ${url} took longer than ${FETCH_TIMEOUT_MS} ms`)),
      FETCH_TIMEOUT_MS,
    );
    req.on('close', () => clearTimeout(deadline));
    req.on('timeout', () => req.destroy(new Error(`GET ${url} timed out`)));
    req.on('error', reject);
    req.end();
  });

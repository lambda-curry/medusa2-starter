import { cimdClientIdProblem, isPublicAddress, publicOnlyLookup, validateClientMetadataDocument } from '../cimd';
import { resolveOAuthConfig } from '../config';
import { redirectUriProblem, redirectUrisProblems } from '../redirect-uri';

describe('redirect URIs', () => {
  it.each([
    'https://chatgpt.com/connector_platform_oauth_redirect',
    'http://localhost:6274/oauth/callback',
    'http://127.0.0.1:33418/callback',
    'http://[::1]/cb',
  ])('accepts %s', (uri) => {
    expect(redirectUriProblem(uri)).toBeUndefined();
  });

  it.each([
    ['http://evil.example/cb', /must use https, or http to localhost/],
    ['https://a.example/cb#frag', /must not contain a fragment/],
    ['https://user:pass@a.example/cb', /must not contain credentials/],
    ['javascript:alert(1)', /must use https/],
    ['/relative', /not an absolute URL/],
    ['', /non-empty string/],
  ])('rejects %s', (uri, problem) => {
    expect(redirectUriProblem(uri)).toMatch(problem);
  });

  it('requires a non-empty list of at most ten', () => {
    expect(redirectUrisProblems([])).toEqual(['redirect_uris must be a non-empty array']);
    expect(redirectUrisProblems('https://a.example/cb')).toEqual(['redirect_uris must be a non-empty array']);
    expect(redirectUrisProblems(Array(11).fill('https://a.example/cb'))).toEqual([
      'redirect_uris may list at most 10 URIs',
    ]);
  });
});

describe('Client ID Metadata Document fetch guard', () => {
  it.each(['8.8.8.8', '104.18.32.47', '2606:4700::6810:84e5'])('treats %s as public', (address) => {
    expect(isPublicAddress(address)).toBe(true);
  });

  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '::1',
    '::ffff:127.0.0.1',
    'fd00::1',
    'fe80::1',
    'not-an-ip',
  ])('blocks %s', (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it('refuses to connect when the hostname resolves to a loopback address', (done) => {
    publicOnlyLookup('localhost', {}, (error) => {
      expect(error).toMatchObject({ code: 'EBLOCKED' });
      done();
    });
  });

  it('accepts only https client_id URLs with a path', () => {
    expect(cimdClientIdProblem('https://chatgpt.com/oauth/client.json')).toBeUndefined();
    expect(cimdClientIdProblem('http://chatgpt.com/oauth/client.json')).toMatch(/must use https/);
    expect(cimdClientIdProblem('https://chatgpt.com/')).toMatch(/must have a path/);
    expect(cimdClientIdProblem('https://chatgpt.com/client.json#x')).toMatch(/credentials or a fragment/);
  });
});

describe('validateClientMetadataDocument', () => {
  const clientId = 'https://chatgpt.com/oauth/client.json';
  const valid = {
    client_id: clientId,
    client_name: 'ChatGPT',
    redirect_uris: ['https://chatgpt.com/connector_platform_oauth_redirect'],
    token_endpoint_auth_methods_supported: ['none', 'private_key_jwt'],
  };

  it('accepts a document that matches its URL and supports public-client auth', () => {
    expect(validateClientMetadataDocument(clientId, valid)).toEqual(valid);
    const { token_endpoint_auth_methods_supported: _, ...withoutMethods } = valid;
    expect(validateClientMetadataDocument(clientId, withoutMethods)).toEqual(withoutMethods);
  });

  it('rejects a document whose client_id does not match the URL it came from', () => {
    expect(() =>
      validateClientMetadataDocument(clientId, { ...valid, client_id: 'https://evil.example/c.json' }),
    ).toThrow(/does not match the URL/);
  });

  it('rejects documents without a name, with bad redirect URIs, or without "none" auth', () => {
    expect(() => validateClientMetadataDocument(clientId, { ...valid, client_name: '' })).toThrow(/client_name/);
    expect(() =>
      validateClientMetadataDocument(clientId, { ...valid, redirect_uris: ['http://evil.example'] }),
    ).toThrow(/must use https/);
    expect(() =>
      validateClientMetadataDocument(clientId, {
        ...valid,
        token_endpoint_auth_methods_supported: ['private_key_jwt'],
      }),
    ).toThrow(/"none"/);
    expect(() => validateClientMetadataDocument(clientId, 'not json')).toThrow(/does not match/);
  });
});

describe('resolveOAuthConfig', () => {
  it('defaults to localhost and derives the MCP resource from the issuer', () => {
    expect(resolveOAuthConfig({})).toMatchObject({
      issuer: 'http://localhost:9000',
      resource: 'http://localhost:9000/mcp',
    });
    expect(resolveOAuthConfig({ issuer: '' }).issuer).toBe('http://localhost:9000');
    expect(resolveOAuthConfig({ issuer: 'https://barrio-demo.example.com/' }).resource).toBe(
      'https://barrio-demo.example.com/mcp',
    );
  });

  it('requires https outside localhost and an origin with no path', () => {
    expect(() => resolveOAuthConfig({ issuer: 'http://barrio.example.com' })).toThrow(/https outside localhost/);
    expect(() => resolveOAuthConfig({ issuer: 'https://barrio.example.com/medusa' })).toThrow(/no path/);
  });
});

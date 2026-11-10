import { createHash, randomBytes } from 'node:crypto';
import { expect, test } from '@playwright/test';

// The recorded demo, end to end: an agent connects over OAuth, finds the product update operation, previews and
// applies a new description through MCP, and the storefront shows it.
const medusaUrl = process.env.E2E_MEDUSA_URL ?? 'http://127.0.0.1:9000';
const admin = { email: 'admin@medusa-test.com', password: 'supersecret' };
const handle = 'barrio-decaf-medium-roast';
const redirectUri = 'http://localhost:6274/oauth/callback';

const form = (data: Record<string, string> | [string, string][]) => new URLSearchParams(data);
const hidden = (html: string, name: string) => {
  const value = html.match(new RegExp(`name="${name}" value="([^"]+)"`))?.[1];
  if (!value) throw new Error(`No ${name} field on the authorize page`);
  return value.replaceAll('&quot;', '"').replaceAll('&amp;', '&');
};

async function connect(): Promise<string> {
  const scopes = ['mcp:read', 'mcp:write'];
  const registration = await fetch(`${medusaUrl}/oauth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ client_name: 'Demo agent', redirect_uris: [redirectUri] }),
  });
  const { client_id } = (await registration.json()) as { client_id: string };
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');

  const login = await fetch(
    `${medusaUrl}/oauth/authorize?${form({ response_type: 'code', client_id, redirect_uri: redirectUri, code_challenge: challenge, code_challenge_method: 'S256', scope: scopes.join(' ') })}`,
  );
  const consent = await fetch(`${medusaUrl}/oauth/authorize/login`, {
    method: 'POST',
    body: form({ request: hidden(await login.text(), 'request'), ...admin }),
  });
  const approved = await fetch(`${medusaUrl}/oauth/authorize/consent`, {
    method: 'POST',
    redirect: 'manual',
    body: form([
      ['grant', hidden(await consent.text(), 'grant')],
      ['decision', 'approve'],
      ...scopes.map((scope): [string, string] => ['scope', scope]),
    ]),
  });
  const code = new URL(approved.headers.get('location') as string).searchParams.get('code') as string;
  const tokens = await fetch(`${medusaUrl}/oauth/token`, {
    method: 'POST',
    body: form({
      grant_type: 'authorization_code',
      code,
      client_id,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });
  return ((await tokens.json()) as { access_token: string }).access_token;
}

async function tool(token: string, name: string, args: Record<string, unknown>) {
  const response = await fetch(`${medusaUrl}/mcp`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      'mcp-protocol-version': '2025-06-18',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
  });
  const text = await response.text();
  const json = text.trimStart().startsWith('{')
    ? text
    : text
        .split('\n')
        .find((line) => line.startsWith('data:'))
        ?.slice(5);
  const result = JSON.parse(json ?? 'null')?.result;
  if (!result || result.isError) throw new Error(`${name} failed: ${JSON.stringify(result ?? text).slice(0, 500)}`);
  return result.structuredContent;
}

test('an agent updates a product description through MCP and the storefront shows it', async ({ page }) => {
  await page.goto(`/products/${handle}`);
  await expect(page.getByRole('heading', { name: 'Barrio Decaf - Medium Roast' })).toBeVisible();

  const token = await connect();
  const search = await tool(token, 'search_api', { query: 'update a product description' });
  expect(search.results[0].operation).toBe('POST /admin/products/{id}');

  const found = await tool(token, 'read_api', {
    operation: 'GET /admin/products',
    query: { handle, fields: 'id,description', limit: 1 },
  });
  const { id, description: original } = found.body.products[0] as { id: string; description: string };
  await expect(page.getByText(original)).toBeVisible();

  const updated = `Updated by an AI agent through MCP at ${new Date().toISOString()}.`;
  const change = { operation: 'POST /admin/products/{id}', path_params: { id }, body: { description: updated } };
  try {
    const preview = await tool(token, 'write_api', { ...change, dry_run: true });
    expect(preview.changes).toEqual([{ field: 'description', current: original, proposed: updated }]);

    const applied = await tool(token, 'write_api', change);
    expect(applied.status).toBe(200);

    // Medusa notifies the storefront asynchronously after the write. Keep this window under the storefront's
    // 10-second cache TTL: a longer one would pass by waiting the cache out and hide a missing revalidation.
    await expect(async () => {
      await page.reload();
      await expect(page.getByText(updated)).toBeVisible({ timeout: 500 });
    }).toPass({ timeout: 5000 });
  } finally {
    await tool(token, 'write_api', { ...change, body: { description: original } });
  }
});

import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { expect, test } from '@playwright/test';

// The consent flow in a real browser. HTTP clients cannot catch browser-only failures, such as a
// Content-Security-Policy that blocks the redirect back to the client after "Allow".
const medusaUrl = process.env.E2E_MEDUSA_URL ?? 'http://127.0.0.1:9000';

test('an admin signs in and approves in the browser, and the client receives the code', async ({ page }) => {
  // A real callback server: Playwright's page.route does not intercept the request a redirect leads to.
  let callback: URL | undefined;
  const server = createServer((req, res) => {
    callback = new URL(req.url ?? '/', 'http://127.0.0.1');
    res.writeHead(200, { 'content-type': 'text/html' }).end('<p>Connected</p>');
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const redirectUri = `http://127.0.0.1:${(server.address() as AddressInfo).port}/oauth/callback`;

  try {
    const registration = await fetch(`${medusaUrl}/oauth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ client_name: 'Browser test', redirect_uris: [redirectUri] }),
    });
    const { client_id } = (await registration.json()) as { client_id: string };
    const challenge = createHash('sha256').update(randomBytes(32).toString('base64url')).digest('base64url');

    await page.goto(
      `${medusaUrl}/oauth/authorize?${new URLSearchParams({
        response_type: 'code',
        client_id,
        redirect_uri: redirectUri,
        code_challenge: challenge,
        code_challenge_method: 'S256',
        state: 'browser-state',
        scope: 'mcp:read',
      })}`,
    );
    await page.getByLabel('Admin email').fill('admin@medusa-test.com');
    await page.getByLabel('Password').fill('supersecret');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('heading', { name: 'Allow access?' })).toBeVisible();
    await page.getByRole('button', { name: 'Allow' }).click();

    await expect(page.getByText('Connected')).toBeVisible();
    expect(callback?.searchParams.get('code')).toMatch(/^mcp_ac_/);
    expect(callback?.searchParams.get('state')).toBe('browser-state');
  } finally {
    server.close();
  }
});

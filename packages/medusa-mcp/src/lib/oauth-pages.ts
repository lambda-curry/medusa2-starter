import type { MedusaResponse } from '@medusajs/framework/http';
import type { McpScope } from '../modules/mcp_oauth/config';

const SCOPE_DESCRIPTIONS: Record<McpScope, string> = {
  'mcp:read': 'Read store data through the Admin and Store APIs',
  'mcp:write': 'Create and update store data',
  'mcp:delete': 'Delete store data',
};

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; --fg: #111827; --muted: #6b7280; --bg: #f9fafb; --card: #fff; --line: #e5e7eb; --accent: #111827; --accent-fg: #fff; --danger: #b91c1c; }
  @media (prefers-color-scheme: dark) { :root { --fg: #f3f4f6; --muted: #9ca3af; --bg: #0b0f17; --card: #111827; --line: #1f2937; --accent: #f3f4f6; --accent-fg: #111827; --danger: #f87171; } }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px; background: var(--bg); color: var(--fg); font: 15px/1.5 system-ui, -apple-system, Segoe UI, sans-serif; }
  main { width: 100%; max-width: 420px; background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 28px; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  p { margin: 0 0 16px; color: var(--muted); }
  label { display: block; font-weight: 500; margin: 0 0 4px; }
  input[type=email], input[type=password] { width: 100%; padding: 9px 11px; border: 1px solid var(--line); border-radius: 8px; background: transparent; color: inherit; font: inherit; margin: 0 0 14px; }
  .scope { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-top: 1px solid var(--line); }
  .scope code { font-size: 13px; }
  .actions { display: flex; gap: 10px; margin-top: 18px; }
  button { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--line); background: transparent; color: inherit; font: inherit; font-weight: 600; cursor: pointer; }
  button.primary { background: var(--accent); color: var(--accent-fg); border-color: var(--accent); }
  .error { color: var(--danger); margin: 0 0 14px; }
  .meta { font-size: 13px; }
</style>
</head>
<body><main>${body}</main></body>
</html>`;
}

/** Sends an authorize page that cannot be framed or cached. */
export function sendPage(res: MedusaResponse, status: number, html: string): void {
  res
    .status(status)
    .set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
      'Referrer-Policy': 'no-referrer',
    })
    .send(html);
}

function clientLine(clientName: string, redirectUri: string): string {
  return `<p><strong>${escapeHtml(clientName)}</strong> wants to use this store's Medusa API as you. After you approve, you return to <strong>${escapeHtml(new URL(redirectUri).host)}</strong>.</p>`;
}

export function loginPage(input: { clientName: string; redirectUri: string; request: string; error?: string }): string {
  return layout(
    'Sign in to connect',
    `<h1>Sign in to connect</h1>
${clientLine(input.clientName, input.redirectUri)}
${input.error ? `<p class="error">${escapeHtml(input.error)}</p>` : ''}
<form method="post" action="/oauth/authorize/login">
  <input type="hidden" name="request" value="${escapeHtml(input.request)}">
  <label for="email">Admin email</label>
  <input id="email" name="email" type="email" autocomplete="username" required autofocus>
  <label for="password">Password</label>
  <input id="password" name="password" type="password" autocomplete="current-password" required>
  <div class="actions"><button class="primary" type="submit">Sign in</button></div>
</form>`,
  );
}

export function consentPage(input: {
  clientName: string;
  redirectUri: string;
  scopes: McpScope[];
  grant: string;
}): string {
  const scopes = input.scopes
    .map(
      (scope) => `<label class="scope"><input type="checkbox" name="scope" value="${scope}" checked>
  <span><code>${scope}</code><br><span class="meta">${SCOPE_DESCRIPTIONS[scope]}</span></span></label>`,
    )
    .join('\n');

  return layout(
    'Allow access',
    `<h1>Allow access?</h1>
${clientLine(input.clientName, input.redirectUri)}
<form method="post" action="/oauth/authorize/consent">
  <input type="hidden" name="grant" value="${escapeHtml(input.grant)}">
  ${scopes}
  <p class="meta">Every call runs with your Medusa admin permissions. Clear a box to withhold that permission.</p>
  <div class="actions">
    <button type="submit" name="decision" value="deny">Deny</button>
    <button class="primary" type="submit" name="decision" value="approve">Allow</button>
  </div>
</form>`,
  );
}

export function errorPage(message: string): string {
  return layout('Cannot connect', `<h1>Cannot connect</h1><p class="error">${escapeHtml(message)}</p>`);
}

import type { HttpMethod } from '../openapi/types';

/**
 * Operations no agent may call, whatever the signed-in admin could do in the dashboard. They mint credentials,
 * change identities, run arbitrary workflows, or open long-lived streams. Entries are `METHOD /path` or
 * `* /prefix/**`, and match OpenAPI paths such as `/admin/users/{id}`.
 */
export const BUILT_IN_BLOCKLIST = [
  '* /auth/**',
  '* /admin/api-keys',
  '* /admin/api-keys/**',
  '* /admin/invites',
  '* /admin/invites/**',
  'POST /admin/users/{id}',
  'DELETE /admin/users/{id}',
  'POST /admin/users/{id}/reset-password',
  '* /admin/workflows-executions/{workflow_id}/run',
  '* /admin/workflows-executions/{workflow_id}/steps/**',
  '* /admin/workflows-executions/{workflow_id}/subscribe',
  '* /admin/workflows-executions/{workflow_id}/{transaction_id}/subscribe',
] as const;

interface Rule {
  entry: string;
  method: HttpMethod | '*';
  path: string;
  prefix: boolean;
}

function parseRule(entry: string): Rule {
  const match = /^(\*|GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD) (\/\S*)$/.exec(entry.trim());
  if (!match) throw new Error(`Invalid medusa-mcp blocked operation "${entry}". Use "METHOD /path" or "* /prefix/**".`);
  const [, method, path] = match;
  const prefix = path.endsWith('/**');
  return { entry, method: method as Rule['method'], path: prefix ? path.slice(0, -3) : path, prefix };
}

export interface OperationPolicy {
  /** The blocklist entry that blocks this operation, if any. */
  blockedBy(method: HttpMethod, path: string): string | undefined;
}

export function createPolicy(extraBlocked: readonly string[] = []): OperationPolicy {
  const rules = [...BUILT_IN_BLOCKLIST, ...extraBlocked].map(parseRule);
  return {
    blockedBy(method, path) {
      return rules.find(
        (rule) =>
          (rule.method === '*' || rule.method === method) &&
          (rule.prefix ? path === rule.path || path.startsWith(`${rule.path}/`) : path === rule.path),
      )?.entry;
    },
  };
}

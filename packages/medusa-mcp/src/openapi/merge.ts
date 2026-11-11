import { compareCodeUnits } from './compare';
import type { OpenApiDocument } from './types';

const OPERATION_KEYS = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']);

export interface MergeResult {
  document: OpenApiDocument;
  problems: string[];
}

/**
 * Adds custom path items to a core Medusa document. A custom operation on a path and method Medusa already
 * defines is an error, unless that operation key (`post /admin/promotions/{id}`) is listed in `overrides`.
 */
export function mergeDocuments(
  core: OpenApiDocument,
  custom: Record<string, Record<string, unknown>>,
  overrides: ReadonlySet<string> = new Set(),
): MergeResult {
  const problems: string[] = [];
  const paths = structuredClone(core.paths);

  for (const [routePath, customItem] of Object.entries(custom)) {
    const item = (paths[routePath] ??= {});
    for (const [key, value] of Object.entries(customItem)) {
      const operationKey = `${key} ${routePath}`;
      const isOverride = overrides.has(operationKey);
      if (key in item && !isOverride) {
        problems.push(`${key.toUpperCase()} ${routePath} is already defined by Medusa's core spec`);
        continue;
      }
      item[key] = isOverride
        ? { ...(value as Record<string, unknown>), 'x-medusa-overridden-by-custom-route': true }
        : value;
    }
  }

  const operationIds = new Map<string, string>();
  for (const [routePath, item] of Object.entries(paths)) {
    for (const [key, operation] of Object.entries(item)) {
      const operationId = OPERATION_KEYS.has(key) ? (operation as { operationId?: string }).operationId : undefined;
      if (!operationId) continue;
      const location = `${key.toUpperCase()} ${routePath}`;
      const previous = operationIds.get(operationId);
      if (previous) problems.push(`operationId "${operationId}" is used by both ${previous} and ${location}`);
      operationIds.set(operationId, location);
    }
  }

  const tags = structuredClone(core.tags ?? []);
  const tagNames = new Set(tags.map((tag) => tag.name));
  for (const item of Object.values(paths)) {
    for (const [key, operation] of Object.entries(item)) {
      if (!OPERATION_KEYS.has(key)) continue;
      for (const name of (operation as { tags?: string[] }).tags ?? []) {
        if (tagNames.has(name)) continue;
        tagNames.add(name);
        tags.push({ name });
      }
    }
  }
  tags.sort((left, right) => compareCodeUnits(left.name, right.name));

  return { document: { ...core, paths, tags }, problems };
}

import { buildApiSpec } from '../openapi/build-spec';
import { buildCatalog, type Catalog } from './catalog';
import { createPolicy } from './policy';
import { buildSearchIndex, type SearchIndex } from './search';

export interface ApiRegistry {
  catalog: Catalog;
  search: SearchIndex;
  builtAt: Date;
}

let cached: { key: string; registry: ApiRegistry } | undefined;

/**
 * The published spec, operation catalog, and search index for this process. Built once on first use: route and
 * contract changes restart `medusa develop`, so a new process always starts from the current routes.
 */
export function getApiRegistry(options: {
  projectRoot: string;
  plugins: string[];
  blockedOperations?: readonly string[];
}): ApiRegistry {
  const key = JSON.stringify([options.projectRoot, options.plugins, options.blockedOperations ?? []]);
  if (cached?.key === key) return cached.registry;

  const spec = buildApiSpec({ projectRoot: options.projectRoot, plugins: options.plugins });
  const catalog = buildCatalog(spec, createPolicy(options.blockedOperations));
  const registry = { catalog, search: buildSearchIndex(catalog.operations), builtAt: new Date() };
  cached = { key, registry };
  return registry;
}

import { createHash } from 'node:crypto';
import path from 'node:path';
import { loadCoreSpecs, projectMedusaVersion } from './core-spec';
import { discoverDocumentedRoutes, discoverRoutes, OpenApiContractError } from './discover-routes';
import { buildCustomPaths, projectZodJsonSchema } from './generate';
import { mergeDocuments } from './merge';
import { API_AREAS, type ApiArea, HTTP_METHODS, type OpenApiDocument, type SpecGap } from './types';

const OWN_PACKAGE = '@lambdacurry/medusa-mcp';

export type ApiSpec = {
  medusaVersion: string;
  /** Content hash of the published documents. Equal specs always produce the same revision. */
  revision: string;
  documents: Record<ApiArea, OpenApiDocument>;
  gaps: SpecGap[];
};

export type BuildApiSpecOptions = {
  /** The Medusa project directory, the one containing `src/api`. */
  projectRoot: string;
  /** Plugin package names registered in `medusa-config`. Their routes are reported as gaps. */
  plugins?: string[];
  /** Operation keys such as `post /admin/promotions/{id}` that custom routes may knowingly replace. */
  overrides?: string[];
};

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function isDocumented(documents: Record<ApiArea, OpenApiDocument>, method: string, routePath: string): boolean {
  return API_AREAS.some((area) => Boolean(documents[area].paths[routePath]?.[method.toLowerCase()]));
}

function pluginGaps(projectRoot: string, plugins: string[], documents: Record<ApiArea, OpenApiDocument>): SpecGap[] {
  return plugins
    .filter((name) => name !== OWN_PACKAGE)
    .flatMap((name) => {
      const pluginRoot = path.dirname(require.resolve(`${name}/package.json`, { paths: [projectRoot] }));
      return discoverRoutes(path.join(pluginRoot, '.medusa/server/src/api')).flatMap((route) =>
        route.methods
          .filter((method) => !isDocumented(documents, method, route.path))
          .map((method): SpecGap => ({ method, path: route.path, source: name, reason: 'undocumented-plugin-route' })),
      );
    });
}

/**
 * Builds the published admin and store specs for a Medusa project: the pinned core spec for its Medusa
 * version plus every custom route's `openapi.ts` contract. Throws {@link OpenApiContractError} listing every
 * contract problem.
 */
export function buildApiSpec({ projectRoot, plugins = [], overrides = [] }: BuildApiSpecOptions): ApiSpec {
  const apiDirectory = path.join(projectRoot, 'src/api');
  const routes = discoverDocumentedRoutes(apiDirectory);
  const custom = buildCustomPaths(routes, projectZodJsonSchema(projectRoot), apiDirectory);

  const medusaVersion = projectMedusaVersion(projectRoot);
  const core = loadCoreSpecs(medusaVersion);
  const overrideKeys = new Set(overrides);
  const problems = [...custom.problems];
  const documents = Object.fromEntries(
    API_AREAS.map((area) => {
      const merged = mergeDocuments(core[area], custom.paths[area], overrideKeys);
      problems.push(...merged.problems);
      return [area, merged.document];
    }),
  ) as Record<ApiArea, OpenApiDocument>;

  if (problems.length) throw new OpenApiContractError(problems);

  const gaps = [...custom.gaps, ...pluginGaps(projectRoot, plugins, documents)].sort((left, right) =>
    `${left.path} ${left.method}`.localeCompare(`${right.path} ${right.method}`),
  );
  const revision = createHash('sha256').update(canonicalJson({ medusaVersion, documents })).digest('hex');

  return { medusaVersion, revision, documents, gaps };
}

const OPERATION_KEYS = new Set(HTTP_METHODS.map((method) => method.toLowerCase()));

export function countOperations(document: OpenApiDocument): number {
  return Object.values(document.paths).reduce(
    (total, item) => total + Object.keys(item).filter((key) => OPERATION_KEYS.has(key)).length,
    0,
  );
}

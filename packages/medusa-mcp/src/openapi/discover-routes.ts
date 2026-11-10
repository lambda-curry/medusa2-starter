import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { HTTP_METHODS, type HttpMethod, type OpenApiRouteContract } from './types';

const ROUTE_FILE = /^route\.(ts|js)$/;
const CONTRACT_FILES = ['openapi.ts', 'openapi.js'];
const SKIPPED_DIRECTORIES = new Set(['node_modules', '__tests__']);

export interface DiscoveredRoute {
  /** OpenAPI path, for example `/admin/products/{id}`. */
  path: string;
  /** Methods the route module exports, which are the methods Medusa serves for it. */
  methods: HttpMethod[];
  routeFile: string;
  contractFile?: string;
  contract?: OpenApiRouteContract;
}

export class OpenApiContractError extends Error {
  constructor(readonly problems: string[]) {
    super(`OpenAPI contract check failed:\n${problems.map((problem) => `- ${problem}`).join('\n')}`);
    this.name = 'OpenApiContractError';
  }
}

export function findRouteFiles(directory: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(directory);
  } catch {
    return [];
  }

  return entries
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry);
      if (statSync(entryPath).isDirectory()) {
        return SKIPPED_DIRECTORIES.has(entry) ? [] : findRouteFiles(entryPath);
      }
      return ROUTE_FILE.test(entry) ? [entryPath] : [];
    })
    .sort();
}

export function toOpenApiPath(apiDirectory: string, routeFile: string): string {
  const segments = path.relative(apiDirectory, path.dirname(routeFile)).split(path.sep).filter(Boolean);

  return `/${segments
    .map((segment) => {
      const parameter = /^\[([A-Za-z_][A-Za-z0-9_]*)\]$/.exec(segment);
      if (parameter) return `{${parameter[1]}}`;
      if (segment.includes('[') || segment.includes(']')) {
        throw new OpenApiContractError([`Unsupported route segment "${segment}" in ${routeFile}`]);
      }
      return segment;
    })
    .join('/')}`;
}

export function exportedMethods(routeModule: Record<string, unknown>): HttpMethod[] {
  return HTTP_METHODS.filter((method) => typeof routeModule[method] === 'function');
}

function loadModule(file: string): Record<string, unknown> {
  return require(file) as Record<string, unknown>;
}

function findContractFile(routeFile: string): string | undefined {
  const directory = path.dirname(routeFile);
  return CONTRACT_FILES.map((file) => path.join(directory, file)).find((file) => {
    try {
      return statSync(file).isFile();
    } catch {
      return false;
    }
  });
}

/** Lists the routes under an API directory and the methods each one serves, without requiring contracts. */
export function discoverRoutes(apiDirectory: string): DiscoveredRoute[] {
  return findRouteFiles(apiDirectory).map((routeFile) => ({
    path: toOpenApiPath(apiDirectory, routeFile),
    methods: exportedMethods(loadModule(routeFile)),
    routeFile,
  }));
}

/**
 * Lists the routes under an API directory and pairs each with its `openapi.ts` contract. Throws one
 * {@link OpenApiContractError} listing every route with a missing contract or a method mismatch.
 */
export function discoverDocumentedRoutes(apiDirectory: string): DiscoveredRoute[] {
  const problems: string[] = [];
  const routes = discoverRoutes(apiDirectory).map((route): DiscoveredRoute => {
    const relativeRoute = path.relative(apiDirectory, route.routeFile);
    if (!route.methods.length) {
      problems.push(`${relativeRoute} exports no HTTP method handlers`);
      return route;
    }

    const contractFile = findContractFile(route.routeFile);
    if (!contractFile) {
      problems.push(`${relativeRoute} has no openapi.ts contract next to it`);
      return route;
    }

    const contract = loadModule(contractFile).default as OpenApiRouteContract | undefined;
    if (!contract?.operations || !contract.tag) {
      problems.push(`${path.relative(apiDirectory, contractFile)} must default-export { tag, operations }`);
      return { ...route, contractFile };
    }

    const documented = Object.keys(contract.operations) as HttpMethod[];
    const missing = route.methods.filter((method) => !documented.includes(method));
    const orphaned = documented.filter((method) => !route.methods.includes(method));
    if (missing.length || orphaned.length) {
      problems.push(
        `${relativeRoute} and its contract disagree. Undocumented: ${missing.join(', ') || 'none'}. Documented but not exported: ${orphaned.join(', ') || 'none'}.`,
      );
    }

    return { ...route, contractFile, contract };
  });

  if (problems.length) throw new OpenApiContractError(problems);
  return routes;
}

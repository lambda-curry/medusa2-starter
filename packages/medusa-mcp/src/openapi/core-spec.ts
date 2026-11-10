import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { API_AREAS, type ApiArea, type OpenApiDocument } from './types';

interface SpecManifest {
  medusaVersion: string;
  specs: Record<ApiArea, { file: string; sha256: string }>;
}

const PACKAGE_NAME = '@lambdacurry/medusa-mcp';

function packageRoot(): string {
  let directory = __dirname;
  while (directory !== path.dirname(directory)) {
    const manifest = path.join(directory, 'package.json');
    if (existsSync(manifest) && JSON.parse(readFileSync(manifest, 'utf8')).name === PACKAGE_NAME) return directory;
    directory = path.dirname(directory);
  }
  throw new Error(`Could not find the ${PACKAGE_NAME} package root from ${__dirname}`);
}

export function specsDirectory(): string {
  return path.join(packageRoot(), 'specs');
}

/** The `@medusajs/medusa` version the project at `projectRoot` resolves. */
export function projectMedusaVersion(projectRoot: string): string {
  const manifest = require.resolve('@medusajs/medusa/package.json', { paths: [projectRoot] });
  return (JSON.parse(readFileSync(manifest, 'utf8')) as { version: string }).version;
}

/**
 * Loads the pinned core Medusa specs matching the project's Medusa version and verifies each against the
 * checksum recorded when it was fetched.
 */
export function loadCoreSpecs(
  medusaVersion: string,
  specsRoot: string = specsDirectory(),
): Record<ApiArea, OpenApiDocument> {
  const directory = path.join(specsRoot, medusaVersion);
  if (!existsSync(directory)) {
    const pinned = readdirSync(specsRoot).join(', ') || 'none';
    throw new Error(
      `No pinned core OpenAPI spec for Medusa ${medusaVersion} (pinned: ${pinned}). Run: node scripts/fetch-core-specs.mjs ${medusaVersion}`,
    );
  }

  const manifest = JSON.parse(readFileSync(path.join(directory, 'manifest.json'), 'utf8')) as SpecManifest;
  return Object.fromEntries(
    API_AREAS.map((area) => {
      const { file, sha256 } = manifest.specs[area];
      const text = gunzipSync(readFileSync(path.join(directory, file))).toString('utf8');
      const actual = createHash('sha256').update(text).digest('hex');
      if (actual !== sha256) {
        throw new Error(`Core ${area} spec for Medusa ${medusaVersion} fails its checksum: ${actual} != ${sha256}`);
      }
      return [area, JSON.parse(text) as OpenApiDocument];
    }),
  ) as Record<ApiArea, OpenApiDocument>;
}

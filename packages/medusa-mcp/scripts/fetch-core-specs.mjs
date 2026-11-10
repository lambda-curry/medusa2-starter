// Pins Medusa's published core OpenAPI specs for one version into specs/<version>/.
// Usage: node scripts/fetch-core-specs.mjs 2.22.1
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
  throw new Error('Pass an exact Medusa version, for example: node scripts/fetch-core-specs.mjs 2.22.1');
}

const specsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../specs', version);
const manifest = { medusaVersion: version, source: 'https://docs.medusajs.com/api/versions', specs: {} };

for (const area of ['admin', 'store']) {
  const url = `https://assets.docs.medusajs.com/api-reference/specs/versions/${version}/${area}/openapi.full.json`;
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`GET ${url} returned HTTP ${response.status}`);

  const text = await response.text();
  const document = JSON.parse(text);
  if (document.info?.version !== version) {
    throw new Error(`${url} describes version ${document.info?.version}, expected ${version}`);
  }

  const file = `${area}.openapi.json.gz`;
  await mkdir(specsDir, { recursive: true });
  await writeFile(path.join(specsDir, file), gzipSync(text, { level: 9 }));
  manifest.specs[area] = { file, url, sha256: createHash('sha256').update(text).digest('hex') };
  console.log(`${area}: ${Object.keys(document.paths).length} paths, sha256 ${manifest.specs[area].sha256}`);
}

await writeFile(path.join(specsDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

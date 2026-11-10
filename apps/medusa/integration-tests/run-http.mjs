// Runs each HTTP integration test file in its own Jest process. Booting a second Medusa app inside one Jest
// process fails every module loader with "Map.prototype.set called on incompatible receiver", so files cannot
// share a process. Pass file name filters as arguments to run a subset.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const httpDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'http');
const jestBin = createRequire(import.meta.url).resolve('jest/bin/jest');
const filters = process.argv.slice(2);
const files = readdirSync(httpDir)
  .filter((file) => file.endsWith('.spec.ts'))
  .filter((file) => !filters.length || filters.some((filter) => file.includes(filter)))
  .sort();

if (!files.length) {
  console.error(`No HTTP integration tests match: ${filters.join(', ')}`);
  process.exit(1);
}

for (const file of files) {
  const result = spawnSync(process.execPath, [jestBin, '--silent=false', '--runInBand', '--forceExit', path.join(httpDir, file)], {
    stdio: 'inherit',
    env: { ...process.env, TEST_TYPE: 'integration:http', NODE_OPTIONS: '--experimental-vm-modules' },
  });
  if (result.status !== 0) {
    console.error(`HTTP integration tests failed in ${file}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`HTTP integration tests passed in ${files.length} files: ${files.join(', ')}`);

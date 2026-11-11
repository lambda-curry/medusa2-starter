// Lets a production Docker image install workspace packages such as @lambdacurry/medusa-mcp.
//
// The runner stage installs an app's built package.json on its own, outside the monorepo, so `workspace:`
// dependencies have nothing to resolve to. A symlinked workspace would not work anyway: the package would resolve
// peers like @medusajs/framework from its own folder, where production installs leave none. So the installer stage
// packs each workspace package into a tarball, and the runner points the dependency at it, which installs the
// package into the app's node_modules the same way npm-published plugins are installed. The root manifest's
// `resolutions` are carried over too, since they pin versions (all of @medusajs/*) that the app manifest omits.
//
//   node scripts/docker-workspace-packages.mjs pack <out-dir>              (repo root, after building)
//   node scripts/docker-workspace-packages.mjs use <out-dir> <package.json>
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [mode, outDir, packageJsonPath] = process.argv.slice(2);
const indexFile = (dir) => path.join(dir, 'index.json');

/** The concrete files a package.json `exports` field points to; wildcard targets are skipped. */
function exportTargets(exports) {
  if (typeof exports === 'string') return exports.includes('*') ? [] : [exports];
  if (exports && typeof exports === 'object') return Object.values(exports).flatMap(exportTargets);
  return [];
}

if (mode === 'pack' && outDir) {
  mkdirSync(outDir, { recursive: true });
  const packages = {};
  for (const dir of existsSync('packages') ? readdirSync('packages') : []) {
    const manifest = path.join('packages', dir, 'package.json');
    if (!existsSync(manifest)) continue;
    const { name, exports } = JSON.parse(readFileSync(manifest, 'utf8'));
    const tarball = path.resolve(outDir, `${dir}.tgz`);
    execFileSync('yarn', ['workspace', name, 'pack', '--out', tarball], { stdio: 'inherit' });
    // A package whose build output was left out of the tarball still installs, and only fails when Medusa boots.
    const packed = new Set(execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' }).split('\n'));
    const missing = exportTargets(exports).filter((target) => !packed.has(path.posix.join('package', target)));
    if (missing.length > 0) throw new Error(`${name} was packed without its exports: ${missing.join(', ')}`);
    packages[name] = tarball;
  }
  const { resolutions = {} } = JSON.parse(readFileSync('package.json', 'utf8'));
  writeFileSync(indexFile(outDir), `${JSON.stringify({ packages, resolutions }, null, 2)}\n`);
  console.log(`Packed ${Object.keys(packages).length} workspace package(s): ${Object.keys(packages).join(', ') || 'none'}`);
} else if (mode === 'use' && outDir && packageJsonPath) {
  const { packages, resolutions } = JSON.parse(readFileSync(indexFile(outDir), 'utf8'));
  const manifest = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const rewritten = [];
  for (const field of ['dependencies', 'optionalDependencies']) {
    for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
      if (!String(spec).startsWith('workspace:')) continue;
      if (!packages[name]) throw new Error(`${name} is a workspace dependency, but no packed tarball exists for it`);
      manifest[field][name] = `file:${packages[name]}`;
      rewritten.push(name);
    }
  }
  manifest.resolutions = { ...resolutions, ...manifest.resolutions };
  writeFileSync(packageJsonPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Using packed tarballs for: ${rewritten.join(', ') || 'none'}`);
  console.log(`Applied ${Object.keys(manifest.resolutions).length} resolution(s) from the root and app manifests`);
} else {
  console.error('Usage: docker-workspace-packages.mjs pack <out-dir> | use <out-dir> <package.json>');
  process.exit(1);
}

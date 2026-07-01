import { type ChildProcessByStdio, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { Readable } from 'node:stream';

type Healthcheck = {
  name: string;
  url: string;
};

type SpawnConfig = {
  command: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  logLabel: string;
};

const repoRoot = path.resolve(import.meta.dirname, '..', '..', '..');
const e2eDir = path.resolve(repoRoot, 'apps', 'e2e');
const medusaEnvPath = path.resolve(repoRoot, 'apps', 'medusa', '.env');

const serverLogPath = process.env.E2E_SERVER_LOG ?? path.resolve(repoRoot, 'e2e-server.log');
const medusaUrl = process.env.E2E_MEDUSA_URL ?? 'http://127.0.0.1:9000';
const storefrontUrl = process.env.E2E_STOREFRONT_URL ?? 'http://127.0.0.1:3000';
const waitTimeoutMs = Number.parseInt(process.env.E2E_WAIT_TIMEOUT_MS ?? '180000', 10);
const waitIntervalMs = Number.parseInt(process.env.E2E_WAIT_INTERVAL_MS ?? '2000', 10);

const healthchecks: Healthcheck[] = [
  { name: 'Medusa Backend', url: `${medusaUrl}/health` },
  { name: 'Storefront', url: `${storefrontUrl}/api/health/live` },
];

const baseEnv: NodeJS.ProcessEnv = {
  ...process.env,
  FORCE_COLOR: '0',
  DB_NAME: 'medusa2',
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/medusa2',
  POSTGRES_URL: process.env.POSTGRES_URL ?? 'postgresql://postgres:postgres@localhost:5432/medusa2',
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  STORE_CORS: process.env.STORE_CORS ?? `${storefrontUrl},http://localhost:3000,http://127.0.0.1:3000`,
  ADMIN_CORS: process.env.ADMIN_CORS ?? 'http://localhost:7000,http://localhost:7001',
  AUTH_CORS: process.env.AUTH_CORS ?? 'http://localhost:7000,http://localhost:7001',
  JWT_SECRET: process.env.JWT_SECRET ?? 'e2e-jwt-secret',
  COOKIE_SECRET: process.env.COOKIE_SECRET ?? 'e2e-cookie-secret',
  ADMIN_BACKEND_URL: process.env.ADMIN_BACKEND_URL ?? medusaUrl,
  STRIPE_API_KEY: process.env.STRIPE_API_KEY ?? 'sk_test_e2e',
  PUBLIC_MEDUSA_API_URL: process.env.PUBLIC_MEDUSA_API_URL ?? medusaUrl,
  INTERNAL_MEDUSA_API_URL: process.env.INTERNAL_MEDUSA_API_URL ?? medusaUrl,
  STOREFRONT_URL: process.env.STOREFRONT_URL ?? storefrontUrl,
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY ?? 'pk_test_e2e',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? 'sk_test_e2e',
};

const medusaEnvKeys = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'REDIS_URL',
  'STORE_CORS',
  'ADMIN_CORS',
  'AUTH_CORS',
  'JWT_SECRET',
  'COOKIE_SECRET',
  'ADMIN_BACKEND_URL',
  'STRIPE_API_KEY',
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function spawnDetached(config: SpawnConfig): ChildProcessByStdio<null, Readable, Readable> {
  return spawn(config.command, config.args, {
    cwd: config.cwd,
    env: config.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
}

function runCommand(config: SpawnConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(config.command, config.args, {
      cwd: config.cwd,
      env: config.env,
      stdio: 'inherit',
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${config.logLabel} exited with code ${code}`));
    });
  });
}

function readCommand(config: SpawnConfig): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(config.command, config.args, {
      cwd: config.cwd,
      env: config.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }

      reject(new Error(`${config.logLabel} exited with code ${code}\n${stderr}`));
    });
  });
}

function ensureMedusaEnvFile() {
  if (fs.existsSync(medusaEnvPath)) {
    return false;
  }

  const envContents = medusaEnvKeys.map((key) => `${key}=${baseEnv[key] ?? ''}`).join('\n');
  fs.writeFileSync(medusaEnvPath, `${envContents}\n`);
  return true;
}

async function waitForUrl({ url, name }: Healthcheck) {
  const startedAt = Date.now();

  while (true) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (response.status < 400) return;
    } catch {
      // Keep polling until timeout.
    }

    if (Date.now() - startedAt > waitTimeoutMs) {
      throw new Error(`${name} not ready within ${waitTimeoutMs}ms: ${url}`);
    }

    await sleep(waitIntervalMs);
  }
}

async function seedMedusa() {
  if (process.env.E2E_SKIP_MEDUSA_INIT === 'true') {
    process.stdout.write('Skipping Medusa init because E2E_SKIP_MEDUSA_INIT=true.\n');
    return;
  }

  await runCommand({
    command: 'yarn',
    args: ['workspace', 'medusa', 'medusa:init'],
    cwd: repoRoot,
    env: baseEnv,
    logLabel: 'yarn workspace medusa medusa:init',
  });
}

async function readPublishableKey() {
  const token = await readCommand({
    command: 'docker',
    args: [
      'exec',
      'medusa2-starter-postgres',
      'psql',
      '-U',
      'postgres',
      '-d',
      'medusa2',
      '-t',
      '-A',
      '-c',
      "select token from api_key where type = 'publishable' and revoked_at is null and deleted_at is null order by created_at desc limit 1;",
    ],
    cwd: repoRoot,
    env: baseEnv,
    logLabel: 'read seeded publishable API key',
  });

  if (!token) {
    throw new Error('No seeded publishable API key found.');
  }

  return token;
}

function buildServiceConfigs(env: NodeJS.ProcessEnv): SpawnConfig[] {
  return [
    {
      command: 'yarn',
      args: ['workspace', 'medusa', 'dev'],
      cwd: repoRoot,
      env,
      logLabel: 'yarn workspace medusa dev',
    },
    {
      command: 'yarn',
      args: ['workspace', 'storefront', 'dev', '--host', '127.0.0.1', '--port', '3000'],
      cwd: repoRoot,
      env,
      logLabel: 'yarn workspace storefront dev --host 127.0.0.1 --port 3000',
    },
  ];
}

async function main() {
  const playwrightArgs = process.argv.slice(2).filter((arg) => arg !== '--');
  const logStream = fs.createWriteStream(serverLogPath, { flags: 'a' });
  logStream.write(`\n\n=== E2E run started: ${new Date().toISOString()} ===\n`);

  const devProcs: Array<ReturnType<typeof spawnDetached>> = [];
  let cleanedUp = false;
  let createdMedusaEnvFile = false;

  const cleanup = async () => {
    if (cleanedUp) return;
    cleanedUp = true;

    process.stdout.write('Cleaning up e2e processes...\n');

    for (const proc of devProcs) {
      if (!proc.pid) continue;
      try {
        process.kill(-proc.pid, 'SIGTERM');
      } catch {
        // Process may already have exited.
      }
    }

    await sleep(3000);

    for (const proc of devProcs) {
      if (!proc.pid) continue;
      try {
        process.kill(-proc.pid, 'SIGKILL');
      } catch {
        // Process may already have exited.
      }
    }

    if (createdMedusaEnvFile) {
      fs.rmSync(medusaEnvPath, { force: true });
    }

    logStream.end(`=== E2E run ended: ${new Date().toISOString()} ===\n`);
  };

  const onSignal = (code: number) => {
    void cleanup().finally(() => process.exit(code));
  };

  process.on('SIGINT', () => onSignal(130));
  process.on('SIGTERM', () => onSignal(143));

  try {
    process.stdout.write('Preparing Medusa database for E2E...\n');
    createdMedusaEnvFile = ensureMedusaEnvFile();
    await seedMedusa();

    const publishableKey = process.env.MEDUSA_PUBLISHABLE_KEY ?? (await readPublishableKey());
    const serviceEnv = {
      ...baseEnv,
      MEDUSA_PUBLISHABLE_KEY: publishableKey,
    };

    process.stdout.write('Starting E2E services...\n');
    for (const serviceConfig of buildServiceConfigs(serviceEnv)) {
      logStream.write(`\n=== start ${serviceConfig.logLabel} ===\n`);
      const proc = spawnDetached(serviceConfig);
      proc.stdout.pipe(logStream, { end: false });
      proc.stderr.pipe(logStream, { end: false });
      devProcs.push(proc);
      process.stdout.write(`Started ${serviceConfig.logLabel} (pid=${proc.pid})\n`);
    }

    process.stdout.write('Waiting for E2E services...\n');
    await Promise.all(healthchecks.map(waitForUrl));
    process.stdout.write('E2E services are ready.\n');

    await runCommand({
      command: 'yarn',
      args: ['test:playwright', ...playwrightArgs],
      cwd: e2eDir,
      env: serviceEnv,
      logLabel: 'yarn test:playwright',
    });
  } finally {
    await cleanup();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`${message}\n`);

  const logHint = fs.existsSync(serverLogPath) ? `\nService logs: ${serverLogPath}\n` : '';
  if (logHint) process.stderr.write(logHint);

  process.exit(1);
});

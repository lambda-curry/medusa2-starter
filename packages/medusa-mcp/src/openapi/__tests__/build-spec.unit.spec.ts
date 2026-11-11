import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildApiSpec, countOperations } from '../build-spec';
import { compareCodeUnits } from '../compare';
import { loadCoreSpecs, specsDirectory } from '../core-spec';
import { findRouteFiles, OpenApiContractError } from '../discover-routes';

const fixture = (name: string) => path.join(__dirname, 'fixtures', name);

const CORE_ADMIN_OPERATIONS = 414;
const CORE_STORE_OPERATIONS = 79;

function contractProblems(run: () => unknown): string[] {
  try {
    run();
  } catch (error) {
    if (error instanceof OpenApiContractError) return error.problems;
    throw error;
  }
  throw new Error('Expected an OpenApiContractError');
}

describe('buildApiSpec', () => {
  const spec = buildApiSpec({ projectRoot: fixture('valid') });
  const admin = spec.documents.admin;

  it('adds documented custom routes to the pinned core spec for the project Medusa version', () => {
    expect(spec.medusaVersion).toBe('2.22.1');
    expect(countOperations(admin)).toBe(CORE_ADMIN_OPERATIONS + 4);
    expect(countOperations(spec.documents.store)).toBe(CORE_STORE_OPERATIONS + 1);
    expect(admin.paths['/admin/widgets']).toEqual(
      expect.objectContaining({ get: expect.any(Object), post: expect.any(Object) }),
    );
    expect(Object.keys(admin.paths['/admin/widgets/{id}']).sort()).toEqual(['delete', 'get']);
    expect(spec.documents.store.paths['/store/widgets'].get).toMatchObject({ operationId: 'listStoreWidgets' });
  });

  it('turns path segments, query schemas, bodies, and responses into OpenAPI 3.0 shapes', () => {
    const list = admin.paths['/admin/widgets'].get as Record<string, unknown>;
    expect(list).toMatchObject({
      operationId: 'listAdminWidgets',
      tags: ['Widgets'],
      security: [{ api_token: [] }, { cookie_auth: [] }, { jwt_token: [] }],
      'x-medusa-mcp-source': 'custom',
    });
    expect(list.parameters).toEqual([
      { name: 'limit', in: 'query', required: false, schema: expect.objectContaining({ type: 'integer' }) },
      { name: 'q', in: 'query', required: false, schema: { type: 'string' } },
    ]);

    expect(list.responses).toMatchObject({
      200: {
        content: {
          'application/json': {
            schema: {
              properties: { widgets: { items: { properties: { retired_at: { type: 'string', nullable: true } } } } },
            },
          },
        },
      },
    });

    expect(admin.paths['/admin/widgets'].post).toHaveProperty('requestBody', {
      required: true,
      content: {
        'application/json': {
          schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
        },
      },
    });

    expect((admin.paths['/admin/widgets/{id}'].get as Record<string, unknown>).parameters).toEqual([
      { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    ]);
  });

  it('keeps hidden routes and routes outside /admin and /store out of the documents and reports them as gaps', () => {
    expect(admin.paths['/admin/internal-sql']).toBeUndefined();
    expect(spec.gaps).toEqual([
      { method: 'GET', path: '/admin/internal-sql', source: 'app', reason: 'hidden' },
      { method: 'POST', path: '/hooks/ping', source: 'app', reason: 'outside-admin-and-store' },
    ]);
  });

  it('reports plugins it cannot resolve or scan instead of failing the build', () => {
    const withPlugins = buildApiSpec({
      projectRoot: fixture('valid'),
      plugins: ['@lambdacurry/medusa-mcp', './plugins/bad-segments', 'not-an-installed-plugin'],
    });
    expect(withPlugins.documents).toEqual(spec.documents);
    expect(withPlugins.unscannedPlugins).toEqual([
      { name: './plugins/bad-segments', reason: expect.stringMatching(/Unsupported route segment "\[\.\.\.path\]"/) },
      { name: 'not-an-installed-plugin', reason: expect.any(String) },
    ]);
  });

  it('orders by code unit, independent of locale', () => {
    expect(['b', 'Z', 'a', 'É'].sort(compareCodeUnits)).toEqual(['Z', 'a', 'b', 'É']);
  });

  it('produces the same revision for the same content and a new one when a contract changes', () => {
    expect(buildApiSpec({ projectRoot: fixture('valid') }).revision).toBe(spec.revision);

    const copy = mkdtempSync(path.join(__dirname, 'tmp-'));
    try {
      cpSync(fixture('valid'), copy, { recursive: true });
      const contract = path.join(copy, 'src/api/store/widgets/openapi.ts');
      writeFileSync(contract, readFileSync(contract, 'utf8').replace('List widgets', 'List every widget'));
      const changed = buildApiSpec({ projectRoot: copy });
      expect(changed.revision).not.toBe(spec.revision);
      expect(changed.documents.admin).toEqual(admin);
    } finally {
      rmSync(copy, { recursive: true, force: true });
    }
  });

  it('fails when a route has no contract', () => {
    expect(contractProblems(() => buildApiSpec({ projectRoot: fixture('missing-contract') }))).toEqual([
      'admin/widgets/route.ts has no openapi.ts contract next to it',
    ]);
  });

  it('fails when a contract and its route disagree about methods', () => {
    expect(contractProblems(() => buildApiSpec({ projectRoot: fixture('mismatch') }))).toEqual([
      'admin/widgets/route.ts and its contract disagree. Undocumented: POST. Documented but not exported: DELETE.',
    ]);
  });

  it('fails when a custom route collides with a core operation unless the override is declared', () => {
    expect(contractProblems(() => buildApiSpec({ projectRoot: fixture('collision') }))).toEqual([
      "POST /admin/products/{id} is already defined by Medusa's core spec",
    ]);

    const overridden = buildApiSpec({ projectRoot: fixture('collision'), overrides: ['post /admin/products/{id}'] });
    expect(overridden.documents.admin.paths['/admin/products/{id}'].post).toMatchObject({
      operationId: 'postCustomProductsId',
      'x-medusa-overridden-by-custom-route': true,
    });
  });

  it('fails on duplicate operation ids, including ids the core spec already uses', () => {
    expect(contractProblems(() => buildApiSpec({ projectRoot: fixture('duplicate-id') }))).toEqual([
      'operationId "getThing" is used by both GET /admin/a and GET /admin/b',
    ]);
    expect(contractProblems(() => buildApiSpec({ projectRoot: fixture('core-operation-id') }))).toEqual([
      'operationId "PostProductsId" is used by both POST /admin/products/{id} and GET /admin/thing',
    ]);
  });

  it('rejects route segments it cannot map to an OpenAPI path', () => {
    expect(contractProblems(() => buildApiSpec({ projectRoot: fixture('catch-all') }))[0]).toMatch(
      /Unsupported route segment "\[\.\.\.path\]"/,
    );
  });
});

describe('loadCoreSpecs', () => {
  it('fails for a Medusa version with no pinned spec', () => {
    expect(() => loadCoreSpecs('9.9.9')).toThrow('No pinned core OpenAPI spec for Medusa 9.9.9 (pinned: 2.22.1)');
  });

  it('fails when a pinned spec no longer matches its recorded checksum', () => {
    const root = mkdtempSync(path.join(__dirname, 'tmp-'));
    try {
      cpSync(path.join(specsDirectory(), '2.22.1'), path.join(root, '2.22.1'), { recursive: true });
      const manifestFile = path.join(root, '2.22.1/manifest.json');
      const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
      manifest.specs.store.sha256 = '0'.repeat(64);
      writeFileSync(manifestFile, JSON.stringify(manifest));
      expect(() => loadCoreSpecs('2.22.1', root)).toThrow('Core store spec for Medusa 2.22.1 fails its checksum');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('findRouteFiles', () => {
  it('treats a missing API directory as no routes, and fails on one it cannot read', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'medusa-mcp-routes-'));
    try {
      expect(findRouteFiles(path.join(root, 'missing'))).toEqual([]);
      const unreadable = path.join(root, 'api');
      mkdirSync(unreadable);
      chmodSync(unreadable, 0o000);
      expect(() => findRouteFiles(unreadable)).toThrow(/EACCES/);
    } finally {
      chmodSync(path.join(root, 'api'), 0o700);
      rmSync(root, { recursive: true, force: true });
    }
  });
});

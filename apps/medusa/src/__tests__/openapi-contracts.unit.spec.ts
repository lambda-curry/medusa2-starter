import path from 'node:path';
import { type ApiSpec, buildApiSpec, countOperations } from '@lambdacurry/medusa-mcp/openapi';

const projectRoot = path.resolve(__dirname, '../..');
const config = require('../../medusa-config') as { plugins: (string | { resolve: string })[] };
const plugins = config.plugins.map((plugin) => (typeof plugin === 'string' ? plugin : plugin.resolve));

// Fails when a route under src/api has no openapi.ts contract, or when a contract disagrees with its route.
describe('OpenAPI contracts', () => {
  let spec: ApiSpec;

  beforeAll(() => {
    spec = buildApiSpec({ projectRoot, plugins });
  });

  it('publishes the core Medusa spec plus every documented custom route', () => {
    expect(spec.medusaVersion).toBe('2.22.1');
    expect(countOperations(spec.documents.admin)).toBe(414);
    expect(countOperations(spec.documents.store)).toBe(79);
  });

  it('reports the product-reviews plugin routes as gaps until the plugin ships contracts', () => {
    expect(spec.unscannedPlugins).toEqual([]);
    expect(spec.gaps.filter((gap) => gap.source === 'app')).toEqual([]);
    expect(spec.gaps.map((gap) => `${gap.method} ${gap.path}`)).toEqual([
      'GET /admin/product-review-stats',
      'GET /admin/product-reviews',
      'DELETE /admin/product-reviews/{id}/response',
      'POST /admin/product-reviews/{id}/response',
      'PUT /admin/product-reviews/{id}/response',
      'PUT /admin/product-reviews/{id}/status',
      'GET /store/product-review-stats',
      'GET /store/product-reviews',
      'POST /store/product-reviews',
      'POST /store/product-reviews/uploads',
    ]);
  });
});

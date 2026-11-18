import seed from '../preview-seed';
import { Modules } from '@medusajs/framework/utils';
import { createApiKeysWorkflow, createRegionsWorkflow, createSalesChannelsWorkflow, linkSalesChannelsToApiKeyWorkflow, updateStoresWorkflow } from '@medusajs/core-flows';
import { seedExperienceTypes } from '../seed/experience-types';
import { writeFile } from 'node:fs/promises';
jest.mock('@medusajs/core-flows', () => ({ createApiKeysWorkflow: jest.fn(), createRegionsWorkflow: jest.fn(), createSalesChannelsWorkflow: jest.fn(), linkSalesChannelsToApiKeyWorkflow: jest.fn(), updateStoresWorkflow: jest.fn() }));
jest.mock('../seed/experience-types', () => ({ seedExperienceTypes: jest.fn() }));
jest.mock('node:fs/promises', () => ({ writeFile: jest.fn() }));

test('refuses to seed outside explicit preview mode', async () => {
  const original = process.env.PREVIEW_MODE;
  delete process.env.PREVIEW_MODE;
  await expect(seed({ container: {} } as any)).rejects.toThrow('explicit preview');
  if (original !== undefined) process.env.PREVIEW_MODE = original;
});

test('retries preserve menu edits and changed Admin password without duplicate records', async () => {
  const originalMode = process.env.PREVIEW_MODE, originalPassword = process.env.PREVIEW_ADMIN_PASSWORD;
  process.env.PREVIEW_MODE = 'true'; process.env.PREVIEW_ADMIN_PASSWORD = 'synthetic-test-only';
  const store: any = { id: 'store', metadata: {} };
  const rows: any = { channels: [], keys: [], regions: [], menus: [], prices: [], users: [] };
  let identity: any;
  const services: any = {
    [Modules.STORE]: { listStores: async () => [store], updateStores: async (_: any, data: any) => Object.assign(store, data) },
    [Modules.SALES_CHANNEL]: { listSalesChannels: async () => rows.channels },
    [Modules.API_KEY]: { listApiKeys: async () => rows.keys },
    [Modules.REGION]: { listRegions: async () => rows.regions },
    [Modules.USER]: { listUsers: async () => rows.users, createUsers: jest.fn(async (data) => { const user = { id: 'user', ...data }; rows.users.push(user); return user; }) },
    [Modules.AUTH]: {
      listProviderIdentities: async () => identity ? [{ auth_identity_id: identity.id }] : [],
      retrieveAuthIdentity: async () => identity,
      register: jest.fn(async () => { identity = { id: 'auth', app_metadata: {} }; return { authIdentity: identity }; }),
      updateAuthIdentities: async (data: any) => Object.assign(identity, data),
    },
    experienceTypeModuleService: { listExperienceTypes: async () => [{ id: 'experience' }] },
    menuModuleService: {
      listMenus: async () => rows.menus, createMenus: jest.fn(async (data) => rows.menus.push(data)),
      listMenuExperiencePrices: async () => rows.prices, createMenuExperiencePrices: jest.fn(async (data) => rows.prices.push(data)),
    },
  };
  const workflow = (fn: any, body: any) => fn.mockImplementation(() => ({ run: body }));
  workflow(createSalesChannelsWorkflow, async () => { rows.channels.push({ id: 'channel' }); return { result: rows.channels }; });
  workflow(updateStoresWorkflow, async ({ input }: any) => Object.assign(store, input.update));
  workflow(createRegionsWorkflow, async () => rows.regions.push({ id: 'region' }));
  workflow(createApiKeysWorkflow, async () => { rows.keys.push({ id: 'key', token: 'synthetic-key' }); return { result: rows.keys }; });
  workflow(linkSalesChannelsToApiKeyWorkflow, async () => ({}));
  try {
    const args = { container: { resolve: (name: string) => services[name] } } as any;
    await seed(args);
    rows.menus[0].name = 'Reviewer edited'; rows.prices[0].price_per_person = 150;
    // Retry must look up the existing identity, not authenticate/reset its password.
    process.env.PREVIEW_ADMIN_PASSWORD = 'different-bootstrap-value';
    await seed(args);
    expect(Object.values(rows).map((value: any) => value.length)).toEqual([1, 1, 1, 1, 1, 1]);
    expect(rows.menus[0].name).toBe('Reviewer edited');
    expect(rows.prices[0].price_per_person).toBe(150);
    expect(services[Modules.AUTH].register).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledTimes(2);
  } finally {
    if (originalMode === undefined) delete process.env.PREVIEW_MODE; else process.env.PREVIEW_MODE = originalMode;
    if (originalPassword === undefined) delete process.env.PREVIEW_ADMIN_PASSWORD; else process.env.PREVIEW_ADMIN_PASSWORD = originalPassword;
  }
});

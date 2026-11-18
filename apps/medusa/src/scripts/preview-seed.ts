/** Additive synthetic pilot fixtures. Run serially, only in a preview database. */
import type { ExecArgs, IApiKeyModuleService, IAuthModuleService, IRegionModuleService, ISalesChannelModuleService, IStoreModuleService, IUserModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { createApiKeysWorkflow, createRegionsWorkflow, createSalesChannelsWorkflow, linkSalesChannelsToApiKeyWorkflow, updateStoresWorkflow } from '@medusajs/core-flows';
import { writeFile } from 'node:fs/promises';
import type MenuService from '../modules/menu/service';
import type ExperienceService from '../modules/experience-type/service';
import { seedExperienceTypes } from './seed/experience-types';

export default async function seed({ container }: ExecArgs) {
  if (process.env.PREVIEW_MODE !== 'true' || !process.env.PREVIEW_ADMIN_PASSWORD)
    throw new Error('Preview seed requires explicit preview mode and a private Admin password');
  const stores = container.resolve<IStoreModuleService>(Modules.STORE);
  const channels = container.resolve<ISalesChannelModuleService>(Modules.SALES_CHANNEL);
  const keys = container.resolve<IApiKeyModuleService>(Modules.API_KEY);
  const regions = container.resolve<IRegionModuleService>(Modules.REGION);
  const users = container.resolve<IUserModuleService>(Modules.USER);
  const auth = container.resolve<IAuthModuleService>(Modules.AUTH);
  const [store] = await stores.listStores();
  let channel = store.default_sales_channel_id
    ? (await channels.listSalesChannels({ id: store.default_sales_channel_id }))[0]
    : (await channels.listSalesChannels({ name: 'Preview' }))[0];
  if (!channel) channel = (await createSalesChannelsWorkflow(container).run({ input: { salesChannelsData: [{ name: 'Preview' }] } })).result[0];
  if (!store.default_sales_channel_id) await updateStoresWorkflow(container).run({ input: {
    selector: { id: store.id }, update: { default_sales_channel_id: channel.id, supported_currencies: [{ currency_code: 'usd', is_default: true }] },
  } });
  if (!(await regions.listRegions({ currency_code: 'usd' })).length)
    await createRegionsWorkflow(container).run({ input: { regions: [{ name: 'Preview United States', currency_code: 'usd', countries: ['us'], payment_providers: ['pp_system_default'] }] } });
  // Preserve renamed keys by storing their stable ID on the preview store.
  const keyId = store.metadata?.preview_api_key_id as string | undefined;
  let key = (await keys.listApiKeys(keyId ? { id: keyId } : { title: 'Preview storefront', type: 'publishable' }))[0];
  if (!key) key = (await createApiKeysWorkflow(container).run({ input: { api_keys: [{ title: 'Preview storefront', type: 'publishable', created_by: '' }] } })).result[0];
  await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: key.id, add: [channel.id] } });
  if (!keyId) await stores.updateStores(store.id, { metadata: { ...store.metadata, preview_api_key_id: key.id } });

  const experiences = container.resolve<ExperienceService>('experienceTypeModuleService');
  await seedExperienceTypes(experiences);
  const menu = container.resolve<MenuService>('menuModuleService');
  if (!(await menu.listMenus({ id: 'menu_preview' })).length)
    await menu.createMenus({ id: 'menu_preview', name: 'Preview Seasonal Dinner', status: 'active' });
  for (const experience of await experiences.listExperienceTypes({})) {
    if (!(await menu.listMenuExperiencePrices({ menu_id: 'menu_preview', experience_type_id: experience.id })).length)
      await menu.createMenuExperiencePrices({ menu_id: 'menu_preview', experience_type_id: experience.id, price_per_person: 12500 });
  }
  const email = 'chef@example.invalid';
  let user = (await users.listUsers({ email }))[0];
  if (!user) user = await users.createUsers({ email, first_name: 'Preview', last_name: 'Chef' });
  // Existing provider identities retain reviewer-changed passwords.
  const [provider] = await auth.listProviderIdentities({ entity_id: email, provider: 'emailpass' });
  let identity = provider?.auth_identity_id ? await auth.retrieveAuthIdentity(provider.auth_identity_id) : undefined;
  if (!identity) {
    const result = await auth.register('emailpass', { body: { email, password: process.env.PREVIEW_ADMIN_PASSWORD } });
    identity = result.authIdentity;
  }
  if (!identity) throw new Error('Preview Admin identity unavailable');
  if (identity.app_metadata?.user_id && identity.app_metadata.user_id !== user.id)
    throw new Error('Preview Admin identity already belongs to another user');
  if (!identity.app_metadata?.user_id)
    await auth.updateAuthIdentities({ id: identity.id, app_metadata: { ...identity.app_metadata, user_id: user.id } });
  await writeFile('./preview-emails/bootstrap.json', JSON.stringify({ publishable_key: key.token, admin_email: email }), { mode: 0o600 });
}

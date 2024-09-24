import type { ResponsePromise } from '@medusajs/medusa-js';
import { BaseResource } from '@medusajs/medusa-js';
import type { SiteSettingsRes } from '../types';

export class SiteSettingsResource extends BaseResource {
  retrieve(customHeaders: Record<string, any> = {}): ResponsePromise<SiteSettingsRes> {
    const path = '/store/site-settings';

    return this.client.request('GET', path, {}, {}, customHeaders);
  }
}

import Medusa, { type Config } from '@medusajs/js-sdk';
import { ExtendedAdminSDK } from './admin';
import { ExtendedStorefrontSDK } from './store';

export class PageBuilderSDK extends Medusa {
  public admin: ExtendedAdminSDK;
  public store: ExtendedStorefrontSDK;

  constructor(config: Config) {
    super(config);

    this.admin = new ExtendedAdminSDK(this.client);
    this.store = new ExtendedStorefrontSDK(this.client);
  }
}

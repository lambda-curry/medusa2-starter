import Medusa, { type Config } from '@medusajs/js-sdk';
import { ExtendedAdminSDK } from './admin';
import { ExtendedStorefrontSDK } from './store';

export class MarketHausSDK extends Medusa {
  public store: ExtendedStorefrontSDK;
  public admin: ExtendedAdminSDK;
  constructor(options: Config) {
    super(options);
    this.store = new ExtendedStorefrontSDK(this.client);
    this.admin = new ExtendedAdminSDK(this.client);
  }
}

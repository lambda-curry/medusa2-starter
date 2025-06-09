import type { Client } from '@medusajs/js-sdk';
import { Store } from '@medusajs/js-sdk';
import { StorePageBuilderResource } from './store-page-builder';

export class ExtendedStorefrontSDK extends Store {
  public pageBuilder: StorePageBuilderResource;

  constructor(client: Client) {
    super(client);

    this.pageBuilder = new StorePageBuilderResource(client);
  }
}

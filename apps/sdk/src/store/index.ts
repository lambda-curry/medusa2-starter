import type { Client } from '@medusajs/js-sdk';
import { Store } from '@medusajs/js-sdk';

export class ExtendedStorefrontSDK extends Store {
  constructor(client: Client) {
    super(client);
  }
}

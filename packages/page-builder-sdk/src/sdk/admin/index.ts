import type { Client } from '@medusajs/js-sdk';
import { Admin } from '@medusajs/js-sdk';
import { AdminPageBuilderResource } from './admin-page-builder';
export class ExtendedAdminSDK extends Admin {
  public pageBuilder: AdminPageBuilderResource;

  constructor(client: Client) {
    super(client);

    this.pageBuilder = new AdminPageBuilderResource(client);
  }
}

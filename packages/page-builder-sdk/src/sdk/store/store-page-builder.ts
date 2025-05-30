import type { Client } from '@medusajs/js-sdk'

export class StorePageBuilderResource {
  constructor(private client: Client) {}

  async test() {
    console.log(this.client)
    return {
      message: 'Hello, world!',
    }
  }
}

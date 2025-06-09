# @lambdacurry/medusa-plugins-sdk

SDK for Medusa plugins by Lambda Curry.

This package is built on top of `@medusajs/js-sdk` and adds a set of resources and methods for interacting with the [Medusa Plugins Collection](https://github.com/lambda-curry/medusa-plugins?tab=readme-ov-file#available-plugins).

## Installation

```bash
yarn install @lambdacurry/medusa-plugins-sdk

# or, if you're using yarn workspaces
yarn workspace my-app add @lambdacurry/medusa-plugins-sdk
```

> Read more about working with **monorepos** in the [Development](#development) section.

## Usage

```typescript
import {
  MedusaPluginsSDK,
  StoreListProductReviewsQuery,
  StoreListProductReviewStatsQuery,
} from '@lambdacurry/medusa-plugins-sdk';

// Initialize the SDK
const sdk = new MedusaPluginsSDK({
  baseUrl: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
  publishableKey: process.env.MEDUSA_PUBLISHABLE_KEY,
});

// List product reviews
const productReviews = await sdk.store.productReviews.list({
  product_id: product.id,
  offset: 0,
  limit: 10,
})
```

### Extending my own SDK
If you need to extend the SDK with your own resources, you can do so by creating your own classes and extending the SDK.

Available resources:
- `AdminProductReviewsResource`
- `StoreProductReviewsResource`

#### Example
```typescript
import Medusa, { Admin, Store, type Client, type Config } from '@medusajs/js-sdk';
import { AdminProductReviewsResource } from '@lambdacurry/medusa-plugins-sdk';

type MyCustom = {
  id: string;
  name: string;
};

type MyQuery = {
  name: string;
};

type MyResponse = {
  myCustom: MyCustom[];
};

export class AdminMyCustomResource {
  constructor(private client: Client) {}

  // example admin method
  async list(query: MyQuery) {
    return this.client.fetch<MyResponse>(`/admin/my-custom`, {
      method: 'GET',
      query,
    });
  }

  // custom admin methods
}

class MyAdmin extends Admin {
  public productReviews: AdminProductReviewsResource;
  public myCustom: AdminMyCustomResource;

  constructor(client: Client) {
    super(client);

    this.productReviews = new AdminProductReviewsResource(client);
    this.myCustom = new AdminMyCustomResource(client);
  }
}

class StoreMyCustomResource {
  constructor(private client: Client) {}

  // custom store methods
}

class MyStore extends Store {
  public store: StoreMyCustomResource;

  constructor(client: Client) {
    super(client);
    this.store = new StoreMyCustomResource(client);
  }
}

export class MyExtendedSDK extends Medusa {
  public override admin: MyAdmin;
  public override store: MyStore;

  constructor(config: Config) {
    super(config);
    this.admin = new MyAdmin(this.client);
    this.store = new MyStore(this.client);
  }
}
```

## Development
> Visit the [README.md](https://github.com/lambda-curry/medusa-plugins/blob/main/README.md) for setting up the development environment.


We use [`yalc`](https://github.com/wclr/yalc) for local development, which allows us to publish the package locally and use it in other projects. So, make sure you have `yalc` installed as a dev dependency in your project.

To publish the package locally, run:
```bash
# from medusa-plugins/packages/plugins-sdk
yarn dev:publish

# from your project
yarn yalc add @lambdacurry/medusa-plugins-sdk
```

### Working with medusa applications
When working with a Medusa application, you need to ensure that the SDK is included in the Vite config's `optimizeDeps` option.

```typescript
// medusa-config.ts

module.exports = defineConfig({
  // other configs...
  admin: {
    // other admin configs...
    vite: () => {
      return {
        optimizeDeps: {
          include: ['@lambdacurry/medusa-plugins-sdk'],
        },
      };
    },
  },
});
```

### Working with Vite applications
When working with a Vite application, you need to ensure that the SDK is included in the Vite config's `ssr.noExternal` option.

```typescript
// vite.config.ts

export default defineConfig({
  // other configs...
  ssr: {
    noExternal: ['@medusajs/js-sdk', '@lambdacurry/medusa-plugins-sdk'],
  },
});
```

### Working with monorepos
If you're using a monorepo setup, you can use the `hoistingLimits` option in your `package.json` to ensure that the SDK is installed in the correct location.
```typescript
// monorepo/path-to/your-app/package.json
{
  "installConfig": {
    "hoistingLimits": "workspaces"
  },
}
```

## License

MIT © [Lambda Curry](https://lambdacurry.dev)

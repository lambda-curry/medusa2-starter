import type { ProductVariantDTO, CalculatedPriceSet, ProductDTO, ProductStatus } from '@medusajs/types';
import type { Result, Request, Notification } from '@modelcontextprotocol/sdk/types.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { useTestClient } from '../../setup';

const { connectTestClient } = useTestClient();

interface TypedResult extends Result {
  content: Array<{ text: string }>;
}

export interface TestProductVariant {
  title: string;
  prices: Array<{
    amount: number;
    currency_code: string;
  }>;
  options: {
    [key: string]: string;
  };
  inventory_quantity?: number;
  sku?: string;
}

export interface TestProduct extends Omit<Partial<ProductDTO>, 'status' | 'variants' | 'options'> {
  title: string;
  description?: string;
  handle: string;
  status: ProductStatus;
  shipping_profile_id: string;
  options?: Array<{
    title: string;
    values: string[];
  }>;
  variants?: TestProductVariant[];
  sales_channels?: string[];
}

export interface TestProductContext {
  testProduct: ProductDTO;
  usRegionId: string;
  caRegionId: string;
  client: Client<Request, Notification, Result>;
  transport: SSEClientTransport;
  testVariant?: ProductVariantDTO & {
    calculated_price: CalculatedPriceSet;
  };
  shippingProfileId: string;
  salesChannelId?: string;
}

const createUniqueHandle = (base: string) => `${base}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const createUniqueSku = (base: string) => `TEST-${base}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

export const createTestProduct = (overrides: Partial<TestProduct> & { shipping_profile_id: string }): TestProduct => ({
  title: 'Test Product',
  description: 'A test product description',
  handle: createUniqueHandle('test-product'),
  status: 'draft' as ProductStatus,
  options: [
    {
      title: 'Size',
      values: ['S', 'M', 'L'],
    },
  ],
  ...overrides,
  variants: overrides.variants
    ? overrides.variants.map((variant) => ({
        ...variant,
        sku: variant.sku || createUniqueSku(variant.title.replace(/\s+/g, '-').toLowerCase()),
      }))
    : [
        {
          title: 'Test Variant Small',
          prices: [{ amount: 10, currency_code: 'usd' }],
          options: {
            Size: 'S',
          },
          inventory_quantity: 10,
          sku: createUniqueSku('small'),
        },
        {
          title: 'Test Variant Medium',
          prices: [{ amount: 10, currency_code: 'usd' }],
          options: {
            Size: 'M',
          },
          inventory_quantity: 10,
          sku: createUniqueSku('medium'),
        },
        {
          title: 'Test Variant Large',
          prices: [{ amount: 10, currency_code: 'usd' }],
          options: {
            Size: 'L',
          },
          inventory_quantity: 10,
          sku: createUniqueSku('large'),
        },
      ],
});

interface SetupProductOptions {
  status?: ProductStatus;
  title?: string;
  handle?: string;
  variants?: TestProductVariant[];
  productOverrides?: Partial<TestProduct>;
}

export async function setupProductTest(
  client: Client<Request, Notification, Result>,
  options: SetupProductOptions = {},
): Promise<TestProductContext> {
  const {
    status = 'published' as ProductStatus,
    title = 'Test Product',
    handle = createUniqueHandle('test-product'),
    variants,
    productOverrides = {},
  } = options;

  // Fetch regions
  const regionsResult = (await client.callTool({
    name: 'fetch-regions',
    arguments: {},
  })) as TypedResult;

  const regionsContent = JSON.parse(regionsResult.content[0].text);
  const usRegion = regionsContent.regions.find((r: any) => r.name === 'United States');
  const caRegion = regionsContent.regions.find((r: any) => r.name === 'Canada');

  if (!usRegion || !caRegion) {
    throw new Error('Required regions not found. Please ensure seed data is loaded.');
  }

  // Fetch default shipping profile
  const fetchShippingProfileResult = (await client.callTool({
    name: 'fetch-shipping-profiles',
    arguments: {
      type: 'default',
      limit: 1,
    },
  })) as TypedResult;

  const shippingProfileContent = JSON.parse(fetchShippingProfileResult.content[0].text);
  if (!shippingProfileContent.shipping_profiles?.length) {
    throw new Error('No default shipping profile found. Please ensure seed data is loaded.');
  }
  const shippingProfileId = shippingProfileContent.shipping_profiles[0].id;

  // Fetch default sales channel
  const fetchSalesChannelsResult = (await client.callTool({
    name: 'fetch-sales-channels',
    arguments: {
      name: 'Default Sales Channel',
    },
  })) as TypedResult;

  const salesChannelsContent = JSON.parse(fetchSalesChannelsResult.content[0].text);
  if (!salesChannelsContent.sales_channels?.length) {
    throw new Error('Default sales channel not found. Please ensure seed data is loaded.');
  }
  const defaultSalesChannel = salesChannelsContent.sales_channels[0];

  // Create test product using the simplified method
  const testProduct = createTestProduct({
    title,
    handle,
    status,
    shipping_profile_id: shippingProfileId,
    variants: variants ? variants : undefined,
    sales_channels: [defaultSalesChannel.id],
    ...productOverrides,
  });

  const createResult = (await client.callTool({
    name: 'create-products',
    arguments: {
      products: [testProduct],
    },
  })) as TypedResult;

  const createResponse = JSON.parse(createResult.content[0].text);
  const createdProduct = createResponse.products[0];

  // Verify product creation
  const verifyResult = (await client.callTool({
    name: 'fetch-product-variants',
    arguments: { product_ids: [createdProduct.id], limit: 10 },
  })) as TypedResult;

  const verifyContent = JSON.parse(verifyResult.content[0].text);
  if (!verifyContent.variants?.length) {
    throw new Error('Failed to create product with variants');
  }

  return {
    testProduct: createdProduct,
    usRegionId: usRegion.id,
    caRegionId: caRegion.id,
    client,
    transport: client.transport as SSEClientTransport,
    testVariant: verifyContent.variants[0],
    shippingProfileId,
    salesChannelId: defaultSalesChannel.id,
  };
}

export async function teardownProductTest(context: TestProductContext): Promise<void> {
  if (!context.testProduct.id) return;

  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      // Try to reconnect if needed
      try {
        await context.client.connect(context.transport);
      } catch (connError) {
        // Ignore connection errors, as we might already be connected
      }

      await context.client.callTool({
        name: 'delete-products',
        arguments: { ids: [context.testProduct.id] },
      });
      break;
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        console.error('Failed to delete product after max retries:', error);
        throw error;
      }
      // Wait before retrying with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000));

      // Create a new transport for the next attempt
      context.transport = new SSEClientTransport(new URL('http://localhost:9000/mcp/sse'), {
        requestInit: {
          headers: {
            'Content-Type': 'text/event-stream',
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        },
      });
    }
  }
}

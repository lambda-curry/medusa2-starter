import { useTestClient } from '../../setup';
import type { Result } from '@modelcontextprotocol/sdk/types.js';
import { ProductStatus } from '@medusajs/utils';
import { createTestProduct, TestProduct, TestProductVariant } from './product-test.utils';
import {
  CreateProductsResponse,
  DeleteProductsResponse,
  isCreateProductsResponse,
  isDeleteProductsResponse,
} from './product-test.types';

describe('MCP Create Products Integration', () => {
  const { getClient, connectTestClient } = useTestClient();
  let createdProductIds: string[] = [];

  beforeEach(async () => {
    await connectTestClient();
    createdProductIds = [];
  });

  afterEach(async () => {
    const client = getClient();
    await connectTestClient(); // Reconnect before cleanup

    if (createdProductIds.length > 0) {
      try {
        const result = (await client.callTool({
          name: 'delete-products',
          arguments: { ids: createdProductIds },
        })) as Result;

        const parsedContent = JSON.parse((result as Result & { content: Array<{ text: string }> }).content[0].text);
        if (!isDeleteProductsResponse(parsedContent)) {
          console.error('Invalid delete response format:', parsedContent);
          return;
        }
        // console.info(`Successfully cleaned up ${parsedContent.deleted_products.length} products`);
      } catch (error) {
        console.error('Failed to delete products:', error);
      }
    }
  });

  it('should successfully create a single product', async () => {
    const client = getClient();

    // Fetch default shipping profile
    const fetchShippingProfileResult = (await client.callTool({
      name: 'fetch-shipping-profiles',
      arguments: {
        type: 'default',
        limit: 1,
      },
    })) as Result;

    const shippingProfileContent = JSON.parse(
      (fetchShippingProfileResult as Result & { content: Array<{ text: string }> }).content[0].text,
    );
    if (!shippingProfileContent.shipping_profiles?.length) {
      throw new Error('No default shipping profile found. Please ensure seed data is loaded.');
    }
    const shippingProfileId = shippingProfileContent.shipping_profiles[0].id;

    const testProduct = createTestProduct({
      shipping_profile_id: shippingProfileId,
    });

    const result = (await client.callTool({
      name: 'create-products',
      arguments: {
        products: [testProduct],
      },
    })) as Result;

    expect((result as Result).content).toHaveLength(1);
    const parsedContent = JSON.parse((result as Result & { content: Array<{ text: string }> }).content[0].text);
    if (!isCreateProductsResponse(parsedContent)) {
      throw new Error('Invalid response format');
    }
    const content = parsedContent;

    expect(content.products).toHaveLength(1);
    expect(content.message).toBe('Successfully created 1 products');
    expect(content.created_product_ids).toHaveLength(1);

    const product = content.products[0];
    expect(product.title).toBe(testProduct.title);
    expect(product.handle).toBe(testProduct.handle);
    expect(product.status).toBe(testProduct.status);
    expect(product.variants_count).toBe(testProduct.variants?.length);
    expect(product.options_count).toBe(testProduct.options?.length);

    createdProductIds.push(product.id);
  });

  it('should create a product and verify its calculated price', async () => {
    const client = getClient();

    // Fetch default shipping profile
    const fetchShippingProfileResult = (await client.callTool({
      name: 'fetch-shipping-profiles',
      arguments: {
        type: 'default',
        limit: 1,
      },
    })) as Result;

    const shippingProfileContent = JSON.parse(
      (fetchShippingProfileResult as Result & { content: Array<{ text: string }> }).content[0].text,
    );
    if (!shippingProfileContent.shipping_profiles?.length) {
      throw new Error('No default shipping profile found. Please ensure seed data is loaded.');
    }
    const shippingProfileId = shippingProfileContent.shipping_profiles[0].id;

    const testVariant: TestProductVariant = {
      title: 'Test Variant',
      prices: [{ amount: 25, currency_code: 'usd' }],
      options: {
        Size: 'S',
      },
      inventory_quantity: 10,
    };

    const testProduct = createTestProduct({
      shipping_profile_id: shippingProfileId,
      variants: [testVariant],
    });

    const createResult = (await client.callTool({
      name: 'create-products',
      arguments: {
        products: [testProduct],
      },
    })) as Result;

    const createContent = JSON.parse((createResult as Result & { content: Array<{ text: string }> }).content[0].text);
    if (!isCreateProductsResponse(createContent)) {
      throw new Error('Invalid create response format');
    }

    createdProductIds.push(createContent.created_product_ids[0]);

    const fetchResult = (await client.callTool({
      name: 'fetch-products',
      arguments: {
        id: createContent.created_product_ids[0],
        currency_code: 'usd',
      },
    })) as Result;

    const fetchContent = JSON.parse((fetchResult as Result & { content: Array<{ text: string }> }).content[0].text);

    expect(fetchContent.products).toHaveLength(1);
    const fetchedProduct = fetchContent.products[0];

    expect(fetchedProduct.variants).toBeDefined();
    expect(fetchedProduct.variants).toHaveLength(1);
    expect(fetchedProduct.variants[0].calculated_price).toBeDefined();
    expect(fetchedProduct.variants[0].calculated_price.calculated_amount).toBe(25);
    expect(fetchedProduct.variants[0].calculated_price.currency_code).toBe('usd');
  });

  it('should successfully create multiple products', async () => {
    const client = getClient();

    // Fetch default shipping profile
    const fetchShippingProfileResult = (await client.callTool({
      name: 'fetch-shipping-profiles',
      arguments: {
        type: 'default',
        limit: 1,
      },
    })) as Result;

    const shippingProfileContent = JSON.parse(
      (fetchShippingProfileResult as Result & { content: Array<{ text: string }> }).content[0].text,
    );
    if (!shippingProfileContent.shipping_profiles?.length) {
      throw new Error('No default shipping profile found. Please ensure seed data is loaded.');
    }
    const shippingProfileId = shippingProfileContent.shipping_profiles[0].id;

    const testProducts = [
      createTestProduct({
        title: 'Product 1',
        description: 'First test product',
        shipping_profile_id: shippingProfileId,
      }),
      createTestProduct({
        title: 'Product 2',
        description: 'Second test product',
        shipping_profile_id: shippingProfileId,
      }),
    ];

    const result = (await client.callTool({
      name: 'create-products',
      arguments: {
        products: testProducts,
      },
    })) as Result;

    expect((result as Result).content).toHaveLength(1);
    const parsedContent = JSON.parse((result as Result & { content: Array<{ text: string }> }).content[0].text);
    if (!isCreateProductsResponse(parsedContent)) {
      throw new Error('Invalid response format');
    }
    const content = parsedContent;

    expect(content.products).toHaveLength(2);
    expect(content.message).toBe('Successfully created 2 products');
    expect(content.created_product_ids).toHaveLength(2);

    createdProductIds.push(...content.created_product_ids);

    content.products.forEach((product: any, index: number) => {
      expect(product.title).toBe(testProducts[index].title);
      expect(product.handle).toBe(testProducts[index].handle);
      expect(product.status).toBe(testProducts[index].status);
    });
  });

  it('should handle validation errors for empty products array', async () => {
    const client = getClient();

    await expect(
      client.callTool({
        name: 'create-products',
        arguments: {
          products: [], // Empty array should fail validation
        },
      }),
    ).rejects.toThrow();
  });

  it('should handle validation errors for invalid product data', async () => {
    const client = getClient();

    // Fetch default shipping profile
    const fetchShippingProfileResult = (await client.callTool({
      name: 'fetch-shipping-profiles',
      arguments: {
        type: 'default',
        limit: 1,
      },
    })) as Result;

    const shippingProfileContent = JSON.parse(
      (fetchShippingProfileResult as Result & { content: Array<{ text: string }> }).content[0].text,
    );
    if (!shippingProfileContent.shipping_profiles?.length) {
      throw new Error('No default shipping profile found. Please ensure seed data is loaded.');
    }
    const shippingProfileId = shippingProfileContent.shipping_profiles[0].id;

    await expect(
      client.callTool({
        name: 'create-products',
        arguments: {
          products: [
            {
              // Missing required fields like title
              status: 'draft' as ProductStatus,
              shipping_profile_id: shippingProfileId,
            } as TestProduct,
          ],
        },
      }),
    ).rejects.toThrow();
  });
});

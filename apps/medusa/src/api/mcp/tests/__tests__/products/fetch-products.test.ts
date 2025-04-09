import { useTestClient } from '../../setup';
import { setupProductTest, teardownProductTest } from './product-test.utils';
import { ExtendedTypedResult, ExtendedProductResponse } from './product-test.types';

describe('MCP Fetch Products Integration', () => {
  const { connectTestClient } = useTestClient();
  let testContext: Awaited<ReturnType<typeof setupProductTest>>;

  beforeAll(async () => {
    const { client, transport } = await connectTestClient();
    testContext = await setupProductTest(client);
  });

  afterAll(async () => {
    // Get a fresh connection for cleanup
    const { client, transport } = await connectTestClient();
    testContext.client = client;
    testContext.transport = transport;
    await teardownProductTest(testContext);
  });

  describe('Product Fetching', () => {
    it('should fetch products successfully', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-products',
        arguments: {
          limit: 10,
        },
      })) as ExtendedTypedResult;

      const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
      expect(content.products).toBeDefined();
      expect(Array.isArray(content.products)).toBe(true);
    });

    it('should handle pagination', async () => {
      const { client } = await connectTestClient();

      // First, get total count
      const initialResult = (await client.callTool({
        name: 'fetch-products',
        arguments: {
          limit: 100,
        },
      })) as ExtendedTypedResult;

      const initialContent = JSON.parse(initialResult.content[0].text) as ExtendedProductResponse;
      const totalCount = initialContent.count || initialContent.products.length;

      // Now test pagination
      const result = (await client.callTool({
        name: 'fetch-products',
        arguments: {
          limit: 3,
          offset: 0,
        },
      })) as ExtendedTypedResult;

      const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
      expect(content.products).toBeDefined();
      expect(content.products.length).toBeLessThanOrEqual(3);
      expect(content.count || content.products.length).toBe(totalCount);
    });

    it('should filter products by query', async () => {
      const { client } = await connectTestClient();

      // First verify our test product exists
      const verifyResult = (await client.callTool({
        name: 'fetch-products',
        arguments: {
          id: testContext.testProduct.id,
        },
      })) as ExtendedTypedResult;

      const verifyContent = JSON.parse(verifyResult.content[0].text) as ExtendedProductResponse;

      // Now test searching by title
      const result = (await client.callTool({
        name: 'fetch-products',
        arguments: {
          query: 'Test Product',
        },
      })) as ExtendedTypedResult;

      const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
      expect(content.products).toBeDefined();
      expect(content.products.length).toBeGreaterThan(0);
      expect(content.products.some((p) => p.title === 'Test Product')).toBe(true);
    });
  });

  describe('Price Calculations', () => {
    it('should include calculated prices in USD by default', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-products',
        arguments: {
          id: testContext.testProduct.id,
          currency_code: 'usd',
        },
      })) as ExtendedTypedResult;

      const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
      expect(content.products).toBeDefined();
      expect(content.products.length).toBe(1);

      const product = content.products[0];
      expect(product).toBeDefined();
      expect(product.variants).toBeDefined();
      expect(product.variants.length).toBeGreaterThan(0);
      expect(product.variants[0].calculated_price).toEqual(
        expect.objectContaining({
          calculated_amount: 10,
          currency_code: 'usd',
          is_calculated_price_price_list: false,
          is_calculated_price_tax_inclusive: false,
          original_amount: 10,
        }),
      );
    });

    it('should calculate prices in CAD when specified', async () => {
      const { client } = await connectTestClient();

      // Create a product with both USD and CAD prices
      const testVariants = [
        {
          title: 'Test Variant',
          prices: [
            { amount: 10, currency_code: 'usd' },
            { amount: 15, currency_code: 'cad' },
          ],
          options: {
            Size: 'S',
          },
          inventory_quantity: 10,
          sku: `TEST-CAD-${Date.now()}`,
        },
      ];

      const testContext = await setupProductTest(client, {
        variants: testVariants,
      });

      const result = (await client.callTool({
        name: 'fetch-products',
        arguments: {
          id: testContext.testProduct.id,
          currency_code: 'cad',
        },
      })) as ExtendedTypedResult;

      const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
      expect(content.products).toBeDefined();
      expect(content.products.length).toBe(1);

      const product = content.products[0];
      expect(product).toBeDefined();
      expect(product.variants).toBeDefined();
      expect(product.variants.length).toBeGreaterThan(0);
      expect(product.variants[0].calculated_price).toEqual(
        expect.objectContaining({
          calculated_amount: 15,
          currency_code: 'cad',
          is_calculated_price_price_list: false,
          is_calculated_price_tax_inclusive: false,
          original_amount: 15,
        }),
      );

      // Clean up the test product
      await teardownProductTest(testContext);
    });

    it('should handle region override with region_query', async () => {
      const { client } = await connectTestClient();

      // Create a product with both USD and CAD prices
      const testVariants = [
        {
          title: 'Test Variant',
          prices: [
            { amount: 10, currency_code: 'usd' },
            { amount: 15, currency_code: 'cad' },
          ],
          options: {
            Size: 'S',
          },
          inventory_quantity: 10,
          sku: `TEST-REGION-${Date.now()}`,
        },
      ];

      const testContext = await setupProductTest(client, {
        variants: testVariants,
      });

      const result = (await client.callTool({
        name: 'fetch-products',
        arguments: {
          id: testContext.testProduct.id,
          currency_code: 'cad',
          region_query: 'Canada',
        },
      })) as ExtendedTypedResult;

      const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
      expect(content.products).toBeDefined();
      expect(content.products.length).toBe(1);

      const product = content.products[0];
      expect(product).toBeDefined();
      expect(product.variants).toBeDefined();
      expect(product.variants.length).toBeGreaterThan(0);
      expect(product.variants[0].calculated_price).toEqual(
        expect.objectContaining({
          calculated_amount: 15,
          currency_code: 'cad',
          is_calculated_price_price_list: false,
          is_calculated_price_tax_inclusive: false,
          original_amount: 15,
        }),
      );

      // Clean up the test product
      await teardownProductTest(testContext);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid parameters', async () => {
      const { client } = await connectTestClient();

      await expect(
        client.callTool({
          name: 'fetch-products',
          arguments: { limit: 'invalid' as any },
        }),
      ).rejects.toThrow('Invalid arguments for tool fetch-products');
    });

    it('should handle invalid currency code gracefully', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-products',
        arguments: {
          id: testContext.testProduct.id,
          currency_code: 'invalid',
        },
      })) as ExtendedTypedResult;

      const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
      expect(content.error).toBe(true);
      expect(content.message).toContain('No region found for currency code: invalid');
    });

    it('should handle empty results gracefully', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-products',
        arguments: {
          query: 'nonexistentproduct123456789xyz',
          limit: 10,
        },
      })) as ExtendedTypedResult;

      const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
      expect(Array.isArray(content.products)).toBe(true);
      expect(content.products.length).toBe(0);
      expect(content.count).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const { client } = await connectTestClient();

      const start = performance.now();

      const result = (await client.callTool({
        name: 'fetch-products',
        arguments: { limit: 50 },
      })) as ExtendedTypedResult;

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1000); // Should respond within 1 second

      const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
      expect(Array.isArray(content.products)).toBe(true);
      expect(content.products.length).toBeGreaterThan(0);
    });
  });

  // TODO: Add tests for field expansion once it's easier to add categories, collections, options, and tags to products with tools
  //   describe('Field Expansion', () => {
  //     it('should expand categories when requested', async () => {
  //       const { client } = await connectTestClient();

  //       const result = (await client.callTool({
  //         name: 'fetch-products',
  //         arguments: {
  //           id: testContext.testProductId,
  //           expand: ['categories'],
  //         },
  //       })) as ExtendedTypedResult;

  //       const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
  //       const product = content.products[0];

  //       expect(product.categories).toBeDefined();
  //       expect(Array.isArray(product.categories)).toBe(true);
  //       expect(product.categories?.[0]).toEqual(
  //         expect.objectContaining({
  //           id: expect.any(String),
  //           name: expect.any(String),
  //           handle: expect.any(String),
  //         }),
  //       );
  //     });

  //     it('should expand collection data when requested', async () => {
  //       const { client } = await connectTestClient();

  //       const result = (await client.callTool({
  //         name: 'fetch-products',
  //         arguments: {
  //           id: testContext.testProductId,
  //           expand: ['collection'],
  //         },
  //       })) as ExtendedTypedResult;

  //       const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
  //       const product = content.products[0];

  //       expect(product.collection).toBeDefined();
  //       expect(product.collection).toEqual(
  //         expect.objectContaining({
  //           id: expect.any(String),
  //           title: expect.any(String),
  //           handle: expect.any(String),
  //         }),
  //       );
  //     });

  //     it('should expand options when requested', async () => {
  //       const { client } = await connectTestClient();

  //       const result = (await client.callTool({
  //         name: 'fetch-products',
  //         arguments: {
  //           id: testContext.testProductId,
  //           expand: ['options'],
  //         },
  //       })) as ExtendedTypedResult;

  //       const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
  //       const product = content.products[0];

  //       expect(product.options).toBeDefined();
  //       expect(Array.isArray(product.options)).toBe(true);
  //       expect(product.options?.length).toBeGreaterThan(0);
  //       expect(product.options?.[0]).toEqual(
  //         expect.objectContaining({
  //           id: expect.any(String),
  //           title: expect.any(String),
  //           values: expect.any(Array),
  //         }),
  //       );
  //     });

  //     it('should expand tags when requested', async () => {
  //       const { client } = await connectTestClient();

  //       const result = (await client.callTool({
  //         name: 'fetch-products',
  //         arguments: {
  //           id: testContext.testProductId,
  //           expand: ['tags'],
  //         },
  //       })) as ExtendedTypedResult;

  //       const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
  //       const product = content.products[0];

  //       expect(product.tags).toBeDefined();
  //       expect(Array.isArray(product.tags)).toBe(true);
  //       expect(product.tags?.[0]).toEqual(
  //         expect.objectContaining({
  //           id: expect.any(String),
  //           value: expect.any(String),
  //         }),
  //       );
  //     });

  //     it('should handle multiple expansion fields', async () => {
  //       const { client } = await connectTestClient();

  //       const result = (await client.callTool({
  //         name: 'fetch-products',
  //         arguments: {
  //           id: testContext.testProductId,
  //           expand: ['categories', 'collection', 'options', 'tags'],
  //         },
  //       })) as ExtendedTypedResult;

  //       const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
  //       const product = content.products[0];

  //       expect(product.categories).toBeDefined();
  //       expect(product.collection).toBeDefined();
  //       expect(product.options).toBeDefined();
  //       expect(product.tags).toBeDefined();
  //     });

  //     it('should not include expanded fields when not requested', async () => {
  //       const { client } = await connectTestClient();

  //       const result = (await client.callTool({
  //         name: 'fetch-products',
  //         arguments: {
  //           id: testContext.testProductId,
  //         },
  //       })) as ExtendedTypedResult;

  //       const content = JSON.parse(result.content[0].text) as ExtendedProductResponse;
  //       const product = content.products[0];

  //       expect(product.categories).toBeUndefined();
  //       expect(product.collection).toBeUndefined();
  //       expect(product.options).toBeUndefined();
  //       expect(product.tags).toBeUndefined();
  //     });
  //   });
});

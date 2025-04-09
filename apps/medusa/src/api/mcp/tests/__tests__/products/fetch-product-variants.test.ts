import { useTestClient } from '../../setup';
import { ProductStatus } from '@medusajs/utils';
import { setupProductTest, teardownProductTest } from './product-test.utils';
import { TypedResult, VariantResponse } from './product-test.types';

describe('MCP Product Variant Tool Integration', () => {
  const { connectTestClient } = useTestClient();
  let testContext: Awaited<ReturnType<typeof setupProductTest>>;

  beforeAll(async () => {
    const { client, transport } = await connectTestClient();
    testContext = await setupProductTest(client, {
      status: ProductStatus.DRAFT,
      variants: [
        {
          title: 'Test Variant Small',
          prices: [
            { amount: 10, currency_code: 'usd' },
            { amount: 15, currency_code: 'cad' },
          ],
          options: {
            Size: 'S',
          },
          inventory_quantity: 10,
        },
        {
          title: 'Test Variant Medium',
          prices: [
            { amount: 10, currency_code: 'usd' },
            { amount: 15, currency_code: 'cad' },
          ],
          options: {
            Size: 'M',
          },
          inventory_quantity: 10,
        },
      ],
    });
  });

  afterAll(async () => {
    // Get a fresh connection for cleanup
    const { client, transport } = await connectTestClient();
    testContext.client = client;
    testContext.transport = transport;
    await teardownProductTest(testContext);
  });

  describe('Variant Fetching', () => {
    it('should fetch variants successfully', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          limit: 10,
        },
      })) as TypedResult;

      expect(result.content).toBeDefined();
      const content = JSON.parse(result.content[0].text) as VariantResponse;
      expect(Array.isArray(content.variants)).toBe(true);
      expect(content.variants.length).toBeGreaterThan(0);
      expect(content.pagination).toBeDefined();
    });

    it('should handle pagination', async () => {
      const { client } = await connectTestClient();

      // First, get total count
      const initialResult = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          limit: 100,
        },
      })) as TypedResult;

      const initialContent = JSON.parse(initialResult.content[0].text) as VariantResponse;
      const totalCount = initialContent.count;

      // Now test pagination
      const result = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          limit: 1,
          offset: 0,
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as VariantResponse;
      expect(content.variants.length).toBe(1);
      expect(content.count).toBe(totalCount);
      expect(content.pagination.limit).toBe(1);
      expect(content.pagination.offset).toBe(0);
    });

    it('should filter variants by product_id', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          limit: 10,
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as VariantResponse;
      expect(content.variants.length).toBeGreaterThan(0);
      expect(content.variants.every((v) => v.product?.id === testContext.testProduct.id)).toBe(true);
    });

    it('should filter variants by search query', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          query: 'Test Variant Small',
          limit: 10,
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as VariantResponse;
      expect(content.variants.length).toBe(1);
      expect(content.variants[0].title).toBe('Test Variant Small');
    });

    it('should handle empty results gracefully', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          query: 'nonexistentvariant123456789xyz',
          limit: 10,
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text);
      expect(Array.isArray(content.variants)).toBe(true);
      expect(content.variants.length).toBe(0);
      expect(content.count).toBe(0);
      expect(content.message).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid parameters', async () => {
      const { client } = await connectTestClient();

      await expect(
        client.callTool({
          name: 'fetch-product-variants',
          arguments: { limit: 'invalid' as any },
        }),
      ).rejects.toThrow('Invalid arguments for tool fetch-product-variants');
    });
  });

  describe('Response Structure', () => {
    it('should include all required metadata fields', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          limit: 1,
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as VariantResponse;
      expect(content.variants.length).toBeGreaterThan(0);
      const variant = content.variants[0];

      // Check metadata fields
      expect(variant).toHaveProperty('option_count');
      expect(variant).toHaveProperty('in_stock');
      expect(variant).toHaveProperty('calculated_price');
      expect(variant.calculated_price).toEqual(
        expect.objectContaining({
          calculated_amount: 10,
          currency_code: 'usd',
          is_calculated_price_price_list: false,
          is_calculated_price_tax_inclusive: false,
          original_amount: 10,
        }),
      );
    });

    it('should include calculated price from a different currency if specified', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          currency_code: 'cad',
          region_id: testContext.caRegionId,
          limit: 1,
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as VariantResponse;
      const variant = content.variants[0];

      expect(variant).toHaveProperty('calculated_price');
      expect(variant.calculated_price).toEqual(
        expect.objectContaining({
          calculated_amount: 15,
          currency_code: 'cad',
          is_calculated_price_price_list: false,
          is_calculated_price_tax_inclusive: false,
          original_amount: 15,
        }),
      );
    });
  });
});

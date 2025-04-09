import { useTestClient } from '../../setup';
import { ProductStatus } from '@medusajs/utils';
import { setupProductTest, teardownProductTest, TestProductVariant } from './product-test.utils';
import { TypedResult, VariantResponse, DeleteVariantResponse } from './product-test.types';

describe('MCP Delete Product Variants Integration', () => {
  const { connectTestClient } = useTestClient();
  let testContext: Awaited<ReturnType<typeof setupProductTest>>;
  let variantIds: string[] = [];

  beforeAll(async () => {
    const { client, transport } = await connectTestClient();
    testContext = await setupProductTest(client, {
      status: ProductStatus.PUBLISHED,
      variants: [
        {
          title: 'Test Variant Small',
          prices: [
            { amount: 100, currency_code: 'usd' },
            { amount: 150, currency_code: 'cad' },
          ],
          options: {
            Size: 'S',
            Color: 'Red',
          },
          inventory_quantity: 10,
        },
        {
          title: 'Test Variant Large',
          prices: [
            { amount: 100, currency_code: 'usd' },
            { amount: 150, currency_code: 'cad' },
          ],
          options: {
            Size: 'L',
            Color: 'Blue',
          },
          inventory_quantity: 20,
        },
      ],
      productOverrides: {
        options: [
          {
            title: 'Size',
            values: ['S', 'M', 'L', 'XL'],
          },
          {
            title: 'Color',
            values: ['Red', 'Blue', 'Green'],
          },
        ],
      },
    });

    // Store variant IDs for later tests
    const result = (await client.callTool({
      name: 'fetch-product-variants',
      arguments: {
        product_ids: [testContext.testProduct.id],
        limit: 10,
      },
    })) as TypedResult;

    const content = JSON.parse(result.content[0].text) as VariantResponse;
    variantIds = content.variants.map((v) => v.id);
  });

  afterAll(async () => {
    // Get a fresh connection for cleanup
    const { client, transport } = await connectTestClient();
    testContext.client = client;
    testContext.transport = transport;
    await teardownProductTest(testContext);
  });

  describe('Delete Product Variants', () => {
    it('should delete variants from a product', async () => {
      const { client } = await connectTestClient();

      // First, fetch a variant to delete
      const fetchResult = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          query: 'large',
          limit: 1,
        },
      })) as TypedResult;

      const fetchContent = JSON.parse(fetchResult.content[0].text) as VariantResponse;
      const largeVariantId = fetchContent.variants[0].id;

      // Delete the variant
      const result = (await client.callTool({
        name: 'delete-product-variants',
        arguments: {
          product_id: testContext.testProduct.id,
          variant_ids: [largeVariantId],
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as DeleteVariantResponse;
      expect(content.deleted_variant_ids.length).toBe(1);
      expect(content.deleted_variant_ids[0]).toBe(largeVariantId);
      expect(content.message).toContain('Successfully deleted 1 variants');

      // Verify the deletion
      const verifyResult = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          query: 'large',
          limit: 1,
        },
      })) as TypedResult;

      const verifyContent = JSON.parse(verifyResult.content[0].text) as VariantResponse;
      expect(verifyContent.variants.length).toBe(0);
    });

    it('should handle errors when deleting non-existent variants', async () => {
      const { client } = await connectTestClient();

      // Try to delete a non-existent variant ID
      const result = (await client.callTool({
        name: 'delete-product-variants',
        arguments: {
          product_id: testContext.testProduct.id,
          variant_ids: ['non-existent-id'],
        },
      })) as TypedResult;

      const errorContent = JSON.parse(result.content[0].text);
      expect(errorContent.error).toBe(true);
      expect(errorContent.message).toContain('An unexpected error occurred');
      expect(errorContent.details.message).toContain('Variant with ID non-existent-id does not exist');

      // Verify the failed arguments are returned correctly
      expect(errorContent.failedArguments).toEqual({
        product_id: testContext.testProduct.id,
        variant_ids: ['non-existent-id'],
      });
    });
  });
});

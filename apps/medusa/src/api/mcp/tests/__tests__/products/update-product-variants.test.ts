import { useTestClient } from '../../setup';
import { ProductStatus } from '@medusajs/utils';
import { setupProductTest, teardownProductTest, TestProductVariant } from './product-test.utils';
import { TypedResult, VariantResponse, CreateUpdateVariantResponse } from './product-test.types';

describe('MCP Update Product Variants Integration', () => {
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

  describe('Update Product Variants', () => {
    it('should update existing variants', async () => {
      const { client } = await connectTestClient();

      // First, get the variant IDs
      const fetchResult = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          query: 'small',
          limit: 1,
        },
      })) as TypedResult;

      const fetchContent = JSON.parse(fetchResult.content[0].text) as VariantResponse;
      const smallVariantId = fetchContent.variants[0].id;

      // Update the small variant
      const result = (await client.callTool({
        name: 'update-product-variants',
        arguments: {
          product_id: testContext.testProduct.id,
          variants: [
            {
              id: smallVariantId,
              title: 'Test Variant Small Updated',
              prices: [
                { amount: 120, currency_code: 'usd' },
                { amount: 170, currency_code: 'cad' },
              ],
            },
          ],
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as CreateUpdateVariantResponse;
      expect(content.variants.length).toBe(1);
      expect(content.message).toContain('Successfully updated 1 variants');

      // Verify the update
      const verifyResult = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          query: 'updated',
          limit: 1,
        },
      })) as TypedResult;

      const verifyContent = JSON.parse(verifyResult.content[0].text) as VariantResponse;
      expect(verifyContent.variants.length).toBe(1);
      expect(verifyContent.variants[0].title).toBe('Test Variant Small Updated');

      // Check the price was updated
      expect(verifyContent.variants[0].calculated_price.calculated_amount).toBe(120);
    });
  });
});

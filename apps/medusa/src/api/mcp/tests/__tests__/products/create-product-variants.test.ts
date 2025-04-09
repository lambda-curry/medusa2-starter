import { useTestClient } from '../../setup';
import { ProductStatus } from '@medusajs/utils';
import { setupProductTest, teardownProductTest, TestProductVariant } from './product-test.utils';
import { TypedResult, VariantResponse, CreateUpdateVariantResponse } from './product-test.types';

describe('MCP Product Variant Tools Integration', () => {
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

  describe('Create Product Variants', () => {
    it('should create new variants for a product', async () => {
      const { client } = await connectTestClient();

      const newVariants: TestProductVariant[] = [
        {
          title: 'Test Variant Medium',
          prices: [
            { amount: 100, currency_code: 'usd' },
            { amount: 150, currency_code: 'cad' },
          ],
          options: {
            Size: 'M',
            Color: 'Red',
          },
          inventory_quantity: 15,
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
      ];

      const result = (await client.callTool({
        name: 'create-product-variants',
        arguments: {
          product_id: testContext.testProduct.id,
          variants: newVariants,
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as CreateUpdateVariantResponse;
      expect(content.variants.length).toBe(2);
      expect(content.count).toBe(2);
      expect(content.message).toContain('Successfully added 2 variants');

      // Store new variant IDs for later tests
      const newVariantIds = content.variants.map((v) => v.id);
      variantIds = [...variantIds, ...newVariantIds];

      // Verify variants were created with correct data
      expect(content.variants[0].title).toBe('Test Variant Medium');
      expect(content.variants[1].title).toBe('Test Variant Large');

      // Check options were set correctly
      const mediumVariant = content.variants.find((v) => v.title === 'Test Variant Medium');
      expect(mediumVariant?.options?.find((o) => o.value === 'M')).toBeDefined();
      expect(mediumVariant?.options?.find((o) => o.value === 'Red')).toBeDefined();
    });

    it('should handle validation errors when creating variants', async () => {
      const { client } = await connectTestClient();

      // Missing required options should fail

      const result = (await client.callTool({
        name: 'create-product-variants',
        arguments: {
          product_id: testContext.testProduct.id,
          variants: [
            {
              title: 'Invalid Variant',
              prices: [{ amount: 100, currency_code: 'usd' }],
              // Missing required options
            },
          ],
        },
      })) as TypedResult;

      const errorResponse = JSON.parse(result.content[0].text);
      expect(errorResponse.error).toBe(true);
      expect(errorResponse.message).toContain('Variant "Invalid Variant" is missing required options');

      // Verify the failed arguments are included in the response
      expect(errorResponse.failedArguments).toBeDefined();
      expect(errorResponse.failedArguments.product_id).toBe(testContext.testProduct.id);
      expect(errorResponse.failedArguments.variants[0].title).toBe('Invalid Variant');
    });
  });

  describe('Fetch Product Variants', () => {
    it('should fetch variants for a specific product', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          limit: 10,
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as VariantResponse;
      expect(content.variants.length).toBeGreaterThanOrEqual(3); // At least our initial + 2 new variants
      expect(content.variants.every((v) => v.product?.id === testContext.testProduct.id)).toBe(true);

      // Check metadata fields
      const variant = content.variants[0];
      expect(variant).toHaveProperty('option_count');
      expect(variant).toHaveProperty('in_stock');
      expect(variant).toHaveProperty('calculated_price');
    });

    it('should filter variants by search query', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-product-variants',
        arguments: {
          product_ids: [testContext.testProduct.id],
          query: 'medium',
          limit: 10,
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as VariantResponse;
      expect(content.variants.length).toBe(1);
      expect(content.variants[0].title).toBe('Test Variant Medium');
    });
  });
});

import {
  productUpdateSchema,
  productUpdateItemSchema,
} from '../../../../servers/medusa/tools/products/product-tools.schemas';
import { MedusaError, ProductStatus } from '@medusajs/utils';
import { useTestClient } from '../../../setup';
import { setupProductTest, teardownProductTest } from '../product-test.utils';
import type { Result } from '@modelcontextprotocol/sdk/types.js';

interface Content {
  text: string;
}

interface TypedResult {
  content: Content[];
}

interface ProductsResponse {
  products: Array<{
    id: string;
    title: string;
    handle: string;
    status: string;
    categories: Array<{ id: string; name: string }>;
    collection: { id: string; title: string } | null;
    variants_count: number;
    options_count: number;
  }>;
  message: string;
  updated_product_ids: string[];
}

interface ErrorResponse {
  error: true;
  message: string;
  details: {
    type: string;
    message: string;
  };
}

describe('Update Products Tool', () => {
  const { connectTestClient } = useTestClient();
  let testContext: Awaited<ReturnType<typeof setupProductTest>>;

  beforeAll(async () => {
    const { client } = await connectTestClient();
    testContext = await setupProductTest(client);
  });

  afterEach(async () => {
    await teardownProductTest(testContext);
  });

  describe('Schema Validation', () => {
    it('should validate required fields', () => {
      const testData = {
        products: [
          {
            id: 'test-id',
            title: 'Updated Title',
            description: 'Updated Description',
          },
        ],
      };

      const result = productUpdateSchema.safeParse(testData);
      expect(result.success).toBe(true);
    });

    it('should validate optional fields', async () => {
      const testData = {
        products: [
          {
            id: 'test-id',
            title: 'Updated Title',
            is_giftcard: true,
            discountable: false,
            metadata: { test: 'value' },
          },
        ],
      };

      const result = productUpdateSchema.safeParse(testData);
      expect(result.success).toBe(true);
    });

    it('should validate variant options relationship', () => {
      const testData = {
        products: [
          {
            id: 'test-id',
            options: [{ title: 'Size', values: ['Small', 'Medium', 'Large'] }],
            variants: [
              {
                title: 'Test Variant',
                options: { Size: 'Large' },
              },
            ],
          },
        ],
      };

      const result = productUpdateSchema.safeParse(testData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid variant options', () => {
      const testData = {
        products: [
          {
            id: 'test-id',
            options: [{ title: 'Size', values: ['Small', 'Medium', 'Large'] }],
            variants: [
              {
                title: 'Test Variant',
                options: { Color: 'Blue' }, // Invalid option
              },
            ],
          },
        ],
      };

      const result = productUpdateSchema.safeParse(testData);
      expect(result.success).toBe(false);
    });
  });

  describe('Tool Execution', () => {
    it('should update basic product details', async () => {
      const { client } = await connectTestClient();
      const updateData = {
        products: [
          {
            id: testContext.testProduct.id,
            title: 'Updated Product Title',
            description: 'Updated product description',
          },
        ],
      };

      console.log('Updating product with data:', updateData);

      const result = (await client.callTool({
        name: 'update-products',
        arguments: updateData,
      })) as TypedResult;

      console.log('Update response:', result.content[0].text);

      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text) as ProductsResponse;

      // Handle error response
      if ('error' in response) {
        console.error('Error updating product:', response);
        throw new Error(`Failed to update product: ${response.message}`);
      }

      expect(response.products[0].title).toBe(updateData.products[0].title);
      expect(response.message).toContain('Successfully updated');
    });

    it('should update product status', async () => {
      const { client } = await connectTestClient();
      const updateData = {
        products: [
          {
            id: testContext.testProduct.id,
            status: ProductStatus.DRAFT,
          },
        ],
      };

      console.log('Updating product status with data:', updateData);

      const result = (await client.callTool({
        name: 'update-products',
        arguments: updateData,
      })) as TypedResult;

      console.log('Status update response:', result.content[0].text);

      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text) as ProductsResponse;

      // Handle error response
      if ('error' in response) {
        console.error('Error updating product status:', response);
        throw new Error(`Failed to update product status: ${response.message}`);
      }

      expect(response.products[0].status).toBe(ProductStatus.DRAFT);
      expect(response.message).toContain('Successfully updated');
    });

    it('should update product variants', async () => {
      const { client } = await connectTestClient();
      const updateData = {
        products: [
          {
            id: testContext.testProduct.id,
            variants: [
              {
                id: testContext.testVariant?.id,
                title: 'Updated Variant Title',
                sku: 'UPDATED-SKU',
              },
            ],
          },
        ],
      };

      console.log('Updating product variants with data:', updateData);

      const result = (await client.callTool({
        name: 'update-products',
        arguments: updateData,
      })) as TypedResult;

      console.log('Variant update response:', result.content[0].text);

      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text) as ProductsResponse;

      // Handle error response
      if ('error' in response) {
        console.error('Error updating product variants:', response);
        throw new Error(`Failed to update product variants: ${response.message}`);
      }

      expect(response.products[0].variants_count).toBeGreaterThan(0);
      expect(response.message).toContain('Successfully updated');
    });

    it('should handle metadata updates', async () => {
      const { client } = await connectTestClient();
      const metadata = {
        testKey: 'testValue',
        numericValue: 123,
      };

      const updateData = {
        products: [
          {
            id: testContext.testProduct.id,
            metadata,
          },
        ],
      };

      console.log('Updating product metadata with data:', updateData);

      const result = (await client.callTool({
        name: 'update-products',
        arguments: updateData,
      })) as TypedResult;

      console.log('Metadata update response:', result.content[0].text);

      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text) as ProductsResponse;

      // Handle error response
      if ('error' in response) {
        console.error('Error updating product metadata:', response);
        throw new Error(`Failed to update product metadata: ${response.message}`);
      }

      expect(response.updated_product_ids).toContain(testContext.testProduct.id);
      expect(response.message).toContain('Successfully updated');
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent product', async () => {
      const { client } = await connectTestClient();
      const updateData = {
        products: [
          {
            id: 'non-existent-id',
            title: 'Updated Title',
          },
        ],
      };

      console.log('Testing non-existent product update:', updateData);

      const promise = client.callTool({
        name: 'update-products',
        arguments: updateData,
      });

      await expect(promise).rejects.toThrow(/Product .* was not found/);
    });

    it('should handle invalid status transitions', async () => {
      const { client } = await connectTestClient();
      const updateData = {
        products: [
          {
            id: testContext.testProduct.id,
            status: 'invalid_status' as any,
          },
        ],
      };

      console.log('Testing invalid status update:', updateData);

      const promise = client.callTool({
        name: 'update-products',
        arguments: updateData,
      });

      await expect(promise).rejects.toThrow('Invalid arguments for tool update-products');
    });

    it('should handle invalid variant data', async () => {
      const { client } = await connectTestClient();
      const updateData = {
        products: [
          {
            id: testContext.testProduct.id,
            variants: [{ invalid: 'data' }],
          },
        ],
      };

      console.log('Testing invalid variant data:', updateData);

      const promise = client.callTool({
        name: 'update-products',
        arguments: updateData,
      });

      await expect(promise).rejects.toThrow('Invalid arguments for tool update-products');
    });
  });
});

import type { ProductDTO } from '@medusajs/types';
import { ProductStatus } from '@medusajs/utils';
import type { Result } from '@modelcontextprotocol/sdk/types.js';
import { useTestClient } from '../../setup';
import { setupProductTest, teardownProductTest, type TestProductContext } from './product-test.utils';
import { UpdateProductResponse } from './product-test.types';

describe('update-single-product tool', () => {
  const { getClient, connectTestClient } = useTestClient();
  let testContext: TestProductContext;

  beforeEach(async () => {
    await connectTestClient();
  });

  afterEach(async () => {
    if (testContext) {
      await teardownProductTest(testContext);
    }
  });

  describe('product updates', () => {
    it('should update product title', async () => {
      const client = getClient();
      testContext = await setupProductTest(client);

      const result = (await client.callTool({
        name: 'update-single-product',
        arguments: {
          id: testContext.testProduct.id,
          update: {
            title: 'Updated Product Title',
          },
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);
      expect(parsedContent.product.title).toBe('Updated Product Title');
    });

    it('should update product status', async () => {
      const client = getClient();
      testContext = await setupProductTest(client, { status: ProductStatus.DRAFT });

      const result = (await client.callTool({
        name: 'update-single-product',
        arguments: {
          id: testContext.testProduct.id,
          update: {
            status: ProductStatus.PUBLISHED,
          },
        },
      })) as Result & { content: Array<{ text: string }> };

      const parsedContent = JSON.parse(result.content[0].text);

      expect(parsedContent.message).toContain('Successfully updated product');
      expect(parsedContent.product).toBeDefined();
    });

    it('should handle multiple field updates', async () => {
      const client = getClient();
      testContext = await setupProductTest(client);

      const result = (await client.callTool({
        name: 'update-single-product',
        arguments: {
          id: testContext.testProduct.id,
          update: {
            title: 'Updated Title',
            description: 'Updated Description',
            status: ProductStatus.PUBLISHED,
          },
        },
      })) as Result & { content: Array<{ text: string }> };

      const parsedContent = JSON.parse(result.content[0].text);

      expect(parsedContent.product.title).toBe('Updated Title');
      expect(parsedContent.message).toContain('Successfully updated product');
    });
  });

  describe('error handling', () => {
    it('should handle non-existent product with error response', async () => {
      const client = getClient();

      const result = (await client.callTool({
        name: 'update-single-product',
        arguments: {
          id: 'non-existent-id',
          update: {
            title: 'Updated Title',
          },
        },
      })) as Result & { content: Array<{ text: string }> };

      const parsedContent = JSON.parse(result.content[0].text);
      expect(parsedContent.error).toBe(true);
      expect(parsedContent.message).toContain('not found');
    });

    it('should handle invalid status updates', async () => {
      const client = getClient();
      testContext = await setupProductTest(client);

      await expect(
        client.callTool({
          name: 'update-single-product',
          arguments: {
            id: testContext.testProduct.id,
            update: {
              status: 'invalid-status' as ProductStatus,
            },
          },
        }),
      ).rejects.toThrow('Invalid enum value');
    });
  });
});

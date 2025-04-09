import { z } from 'zod';
import type { McpTool, ProductModuleService } from '../types';
import { Modules } from '@medusajs/framework/utils';
import { handleToolError } from '../helpers';

export const deleteProductsSchema = z.object({
  ids: z.array(z.string()).min(1).describe('Array of product IDs to delete'),
});

export const deleteProductsTool: McpTool<typeof deleteProductsSchema> = {
  name: 'delete-products',
  description: 'Delete multiple products from Medusa by their IDs',
  schema: deleteProductsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        return {
          content: [{ type: 'text', text: 'Request context not set' }],
          isError: true,
        };
      }

      logger.info(`Deleting ${args.ids.length} products`);
      const productService = req.scope.resolve(Modules.PRODUCT) as ProductModuleService;

      // First, fetch all products to get their details for the response message
      logger.debug('Retrieving product details before deletion');
      const products = await Promise.all(
        args.ids.map((id) =>
          productService.retrieveProduct(id, {
            select: ['id', 'title', 'handle', 'variants'],
          }),
        ),
      );

      // Store relevant details before deletion
      const productDetails = products.map((product) => ({
        id: product.id,
        title: product.title,
        handle: product.handle,
        variants_count: product.variants?.length || 0,
      }));

      // Delete the products
      logger.debug('Calling productService.deleteProducts');
      await productService.deleteProducts(args.ids);
      logger.info(`Successfully deleted ${args.ids.length} products`);

      // Return a response with the deleted products' details
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                deleted_products: productDetails,
                message: `Successfully deleted ${args.ids.length} products`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return handleToolError(error, args, logger);
    }
  },
};

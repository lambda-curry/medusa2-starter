import { Message, ToolPart } from '../../types';

/**
 * Check if a tool result contains products
 */
export const toolResultHasProducts = (result: ToolPart) => {
  return (
    result.toolInvocation.state === 'result' &&
    typeof result.toolInvocation.result === 'object' &&
    result.toolInvocation.result !== null &&
    'products' in result.toolInvocation.result
  );
};

/**
 * Check if a tool is updating a single product
 */
export const toolIsUpdateSingleProduct = (toolName: string | undefined) => {
  return toolName?.includes('update-single-product');
};

/**
 * Check if a tool is for creating products
 */
export const toolIsCreateProducts = (toolName: string | undefined) => {
  return toolName?.includes('create-products') || toolName?.includes('create_products');
};

/**
 * Extract product ID from tool result
 */
export const extractProductId = (result: ToolPart): string | null => {
  try {
    if (
      result.toolInvocation.state === 'result' &&
      typeof result.toolInvocation.result === 'object' &&
      result.toolInvocation.result !== null
    ) {
      // For single product update
      if ('id' in result.toolInvocation.result) {
        return result.toolInvocation.result.id as string;
      }

      // For batch updates that return the updated product
      if (
        'product' in result.toolInvocation.result &&
        result.toolInvocation.result.product &&
        'id' in result.toolInvocation.result.product
      ) {
        return result.toolInvocation.result.product.id as string;
      }
    }
  } catch (error) {
    console.error('Error extracting product ID:', error);
  }
  return null;
};

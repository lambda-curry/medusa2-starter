import { ToolHandler, ToolHandlerContext } from './tool-handler-registry';
import { extractProductId } from './tool-result-display.helpers';

/**
 * Handler that invalidates product queries when product data is updated
 */
export const invalidateProductQueriesHandler: ToolHandler = (context: ToolHandlerContext) => {
  const { queryClient, isStreamingMessage, result } = context;
  if (!queryClient || !isStreamingMessage || result.toolInvocation.state !== 'result') return;

  const productId = extractProductId(result);

  console.log(
    'Invalidating and refetching product queries',
    productId ? `for product ${productId}` : 'for all products',
  );

  // If we have a specific product ID, only update that product
  if (productId) {
    // Invalidate specific product queries
    queryClient.invalidateQueries({
      queryKey: ['products', 'detail', productId],
      exact: false,
    });

    // Also invalidate product variants - these may not have the product ID in the query key
    // so we'll refresh all variants when a product is updated
    queryClient.invalidateQueries({
      queryKey: ['product_variants'],
      exact: false,
    });

    // Invalidate product reviews for this product
    queryClient.invalidateQueries({
      queryKey: ['product-reviews'],
      exact: false,
    });

    // Then force refetches
    queryClient.refetchQueries({
      queryKey: ['products', 'detail', productId],
      exact: false,
    });

    queryClient.refetchQueries({
      queryKey: ['product_variants'],
      exact: false,
    });

    queryClient.refetchQueries({
      queryKey: ['product-reviews'],
      exact: false,
    });
  } else {
    // Otherwise update all product-related queries

    // First invalidate all product and product-related queries
    // These patterns match your actual query key structures
    queryClient.invalidateQueries({
      queryKey: ['products'],
      exact: false,
    });

    queryClient.invalidateQueries({
      queryKey: ['product_variants'],
      exact: false,
    });

    queryClient.invalidateQueries({
      queryKey: ['product_variant'],
      exact: false,
    });

    queryClient.invalidateQueries({
      queryKey: ['product-reviews'],
      exact: false,
    });

    // Then force refetches
    queryClient.refetchQueries({
      queryKey: ['products'],
      exact: false,
    });

    queryClient.refetchQueries({
      queryKey: ['product_variants'],
      exact: false,
    });

    queryClient.refetchQueries({
      queryKey: ['product_variant'],
      exact: false,
    });

    queryClient.refetchQueries({
      queryKey: ['product-reviews'],
      exact: false,
    });
  }
};

/**
 * Handler that invalidates inventory queries when inventory data is updated
 */
export const invalidateInventoryQueriesHandler: ToolHandler = (context: ToolHandlerContext) => {
  const { queryClient, isStreamingMessage } = context;
  if (!queryClient || !isStreamingMessage) return;

  console.log('Invalidating and refetching inventory queries');

  // First invalidate inventory queries - using the correct query key pattern
  queryClient.invalidateQueries({
    queryKey: ['inventory_items'],
    exact: false,
  });

  // Also invalidate product variants as they may contain inventory information
  queryClient.invalidateQueries({
    queryKey: ['product_variants'],
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: ['product_variant'],
    exact: false,
  });

  // Then force a refetch
  queryClient.refetchQueries({
    queryKey: ['inventory_items'],
    exact: false,
  });

  queryClient.refetchQueries({
    queryKey: ['product_variants'],
    exact: false,
  });

  queryClient.refetchQueries({
    queryKey: ['product_variant'],
    exact: false,
  });
};

/**
 * Handler that logs tool invocation details for debugging
 */
export const logToolInvocationHandler: ToolHandler = (context: ToolHandlerContext) => {
  const { result } = context;
  console.log('Tool Invocation:', {
    toolName: result.toolInvocation.toolName,
    state: result.toolInvocation.state,
  });

  // Log the entire invocation object for debugging
  console.log('Full invocation details:', result.toolInvocation);
};

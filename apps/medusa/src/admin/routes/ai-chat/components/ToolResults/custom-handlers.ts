import { ToolHandler, ToolHandlerContext } from './tool-handler-registry';
import { ToolPart } from '../../types';
import { toast } from '@medusajs/ui';

import { extractProductId } from './tool-result-display.helpers';

/**
 * Handler that shows a toast notification when products are created or updated
 */
export const productToastNotificationHandler: ToolHandler = (context: ToolHandlerContext) => {
  const { result, isStreamingMessage } = context;
  if (!isStreamingMessage || result.toolInvocation.state !== 'result') return;

  const toolName = result.toolInvocation.toolName;
  const productId = extractProductId(result);

  if (toolName?.includes('create_products') || toolName?.includes('create-products')) {
    toast.success('Product Created', {
      description: 'The product was created successfully',
    });
  } else if (toolName?.includes('update') && productId) {
    toast.success('Product Updated', {
      description: `Product ${productId} was updated successfully`,
    });
  }
};

/**
 * Handler that tracks product modifications in local storage for an audit trail
 */
export const productAuditTrailHandler: ToolHandler = (context: ToolHandlerContext) => {
  const { result, isStreamingMessage } = context;
  if (!isStreamingMessage || result.toolInvocation.state !== 'result') return;

  const toolName = result.toolInvocation.toolName;
  const productId = extractProductId(result);

  if (!productId || !toolName?.includes('product')) return;

  try {
    // Get existing audit trail or start a new one
    const auditTrail = JSON.parse(localStorage.getItem('product_audit_trail') || '[]');

    // Add this action to the audit trail
    auditTrail.push({
      timestamp: new Date().toISOString(),
      action: toolName,
      productId,
      resultSummary: JSON.stringify(result.toolInvocation.result).substring(0, 100) + '...',
    });

    // Keep only the last 100 entries
    const trimmedAuditTrail = auditTrail.slice(-100);

    // Store back to local storage
    localStorage.setItem('product_audit_trail', JSON.stringify(trimmedAuditTrail));
  } catch (error) {
    console.error('Failed to update product audit trail:', error);
  }
};

/**
 * Handler that automatically navigates to the product page after creation
 */
export const productNavigationHandler: ToolHandler = (context: ToolHandlerContext) => {
  const { result, isStreamingMessage } = context;
  if (!isStreamingMessage || result.toolInvocation.state !== 'result') return;

  const toolName = result.toolInvocation.toolName;
  const productId = extractProductId(result);

  // Only navigate for product creation, not updates
  if (productId && (toolName?.includes('create_products') || toolName?.includes('create-products'))) {
    // Show a loading toast while navigating
    toast.loading('Navigating', {
      description: 'Taking you to the product page...',
      duration: 2000,
    });

    // Delay navigation to ensure the UI has time to process the streaming response
    setTimeout(() => {
      window.location.href = `/a/products/${productId}`;
    }, 2000);
  }
};

/**
 * Handler that shows an error toast for failed operations
 */
export const errorNotificationHandler: ToolHandler = (context: ToolHandlerContext) => {
  const { result, isStreamingMessage } = context;
  if (!isStreamingMessage) return;

  const { toolInvocation } = result;

  // Check if there was an error in the tool execution
  if (toolInvocation.state === 'result' && toolInvocation.result && 'error' in toolInvocation.result) {
    const errorMessage = toolInvocation.result.error as string;

    console.error('Error in tool execution:', errorMessage);
  }
};

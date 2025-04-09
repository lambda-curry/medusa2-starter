import React, { useEffect } from 'react';
import { Toaster } from '@medusajs/ui';
import { useToolResultHandlers } from './use-tool-handlers';
import { productToastNotificationHandler, productAuditTrailHandler, errorNotificationHandler } from './custom-handlers';

/**
 * Example component showing how to use custom tool handlers in a component
 */
export const ExampleToolHandlerComponent: React.FC = () => {
  // Use the tool result handlers hook with custom handlers
  const { resetProcessedResults } = useToolResultHandlers({
    // Default handlers are automatically registered
    registerDefaultHandlers: true,

    // Register additional custom handlers for specific tools
    customHandlers: [
      // Show toast notifications for product updates and creations
      {
        toolName: ['mcp__update_single_product', 'mcp__create_products'],
        handler: productToastNotificationHandler,
      },

      // Track product modifications in local storage
      {
        toolName: 'mcp__update_single_product',
        handler: productAuditTrailHandler,
      },

      // Show error notifications for failed operations
      {
        toolName: ['*'],
        handler: errorNotificationHandler,
      },

      // Example of inline handler definition
      {
        toolName: 'mcp__delete_products',
        handler: ({ result, isStreamingMessage }) => {
          if (!isStreamingMessage || result.toolInvocation.state !== 'result') return;
          console.log('Product deletion detected!');
          // Perform any needed actions when a product is deleted
        },
      },
    ],
  });

  // Example: Reset the processed results when a new chat session starts
  useEffect(() => {
    // Subscribe to chat session change events (this is just an example)
    const handleNewChatSession = () => {
      console.log('New chat session started - resetting tool result tracking');
      resetProcessedResults();
    };

    // Add event listener for new chat sessions
    window.addEventListener('new-chat-session', handleNewChatSession);

    // Clean up
    return () => {
      window.removeEventListener('new-chat-session', handleNewChatSession);
    };
  }, [resetProcessedResults]);

  return (
    <>
      {/* Include the Toaster component to render the toast notifications */}
      <Toaster />
    </>
  );
};

/**
 * Example showing how to register global handlers at the app level
 */
export const setupGlobalToolHandlers = () => {
  // Import this function and call it once at app initialization
  const { processToolResult, resetProcessedResults } = useToolResultHandlers({
    // Only use specific handlers, not the defaults
    registerDefaultHandlers: false,

    // Register only essential global handlers
    customHandlers: [
      {
        // Catch all tool invocations for analytics
        toolName: ['*'],
        handler: ({ result }) => {
          // Send analytics about tool usage
          const toolName = result.toolInvocation.toolName;
          const timestamp = new Date().toISOString();

          // Example of sending analytics
          if (process.env.NODE_ENV === 'production') {
            try {
              fetch('/api/analytics/log-tool-usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toolName, timestamp }),
              });
            } catch (error) {
              console.error('Failed to log tool usage:', error);
            }
          }
        },
      },
    ],
  });

  // Expose the functions globally if needed
  (window as any).__processToolResult = processToolResult;
  (window as any).__resetToolResultTracking = resetProcessedResults;
};

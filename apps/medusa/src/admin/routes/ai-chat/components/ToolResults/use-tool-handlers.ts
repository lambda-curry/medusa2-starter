import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Message, ToolPart } from '../../types';
import { toolHandlerRegistry, ToolHandler, ToolHandlerContext } from './tool-handler-registry';
import {
  invalidateProductQueriesHandler,
  invalidateInventoryQueriesHandler,
  logToolInvocationHandler,
} from './default-handlers';
import {
  registerProductUpdateHandler,
  registerProductCreateHandler,
  registerInventoryHandler,
} from './tool-handler-registry';
import { productToastNotificationHandler, errorNotificationHandler } from './custom-handlers';

// Initialize default handlers
let defaultHandlersRegistered = false;
function registerDefaultHandlers() {
  if (defaultHandlersRegistered) return;

  // Register product handlers
  registerProductUpdateHandler(invalidateProductQueriesHandler);
  registerProductCreateHandler(invalidateProductQueriesHandler);
  registerProductUpdateHandler(productToastNotificationHandler);
  registerProductCreateHandler(productToastNotificationHandler);

  // Register error notification handler for all tools
  toolHandlerRegistry.registerWildcardHandler(errorNotificationHandler);

  // Register inventory handlers
  registerInventoryHandler(invalidateInventoryQueriesHandler);

  // Register logging for all tools (wildcard)
  toolHandlerRegistry.registerWildcardHandler(logToolInvocationHandler);

  defaultHandlersRegistered = true;
}

/**
 * Generate a unique key for a tool result to track if it's been processed
 */
function getToolResultKey(result: ToolPart): string {
  const { toolInvocation } = result;
  const { toolName, state } = toolInvocation;

  // For result state, include a hash of the result to differentiate between similar calls
  if (state === 'result') {
    // Simple hash just to differentiate results
    const resultString = JSON.stringify(toolInvocation.result || {});
    const resultHash = resultString.split('').reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0);

    return `${toolName}-${state}-${resultHash}`;
  }

  // For other states, the tool name and state are enough
  return `${toolName}-${state}`;
}

/**
 * Custom hook to handle tool results as they stream in
 */
export function useToolResultHandlers(
  options: {
    registerDefaultHandlers?: boolean;
    customHandlers?: Array<{ toolName: string | string[]; handler: ToolHandler }>;
  } = {},
) {
  const { registerDefaultHandlers: shouldRegisterDefaults = true, customHandlers = [] } = options;
  const queryClient = useQueryClient();

  // Track processed tool results to prevent duplicate processing
  const processedResults = useRef<Set<string>>(new Set());

  // Register handlers
  useEffect(() => {
    // Register built-in handlers if requested
    if (shouldRegisterDefaults) {
      registerDefaultHandlers();
    }

    // Register custom handlers
    const cleanupFns: Array<() => void> = [];

    customHandlers.forEach(({ toolName, handler }) => {
      if (Array.isArray(toolName)) {
        toolHandlerRegistry.registerHandlerForMultiple(toolName, handler);
        cleanupFns.push(() => {
          toolName.forEach((name) => toolHandlerRegistry.unregisterHandler(name, handler));
        });
      } else {
        toolHandlerRegistry.registerHandler(toolName, handler);
        cleanupFns.push(() => {
          toolHandlerRegistry.unregisterHandler(toolName, handler);
        });
      }
    });

    // Clean up on unmount
    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [shouldRegisterDefaults]);

  /**
   * Reset processed results tracking
   * Call this when starting a new chat or when you want to reprocess results
   */
  const resetProcessedResults = useCallback(() => {
    processedResults.current.clear();
  }, []);

  /**
   * Process a streaming tool result, ensuring each unique result is only processed once
   */
  const processToolResult = useCallback(
    async (result: ToolPart, message: Message, isStreamingMessage: boolean) => {
      // Generate a unique key for this tool result
      const resultKey = getToolResultKey(result);

      // Skip if we've already processed this exact result
      if (processedResults.current.has(resultKey)) {
        return;
      }

      // Mark as processed before executing handlers to prevent race conditions
      processedResults.current.add(resultKey);

      // Create the context for handlers
      const context: ToolHandlerContext = {
        result,
        message,
        isStreamingMessage,
        queryClient,
      };

      // Execute handlers
      await toolHandlerRegistry.executeHandlers(context);

      // Log that we processed this result (for debugging)
      console.log(`Processed tool result: ${result.toolInvocation.toolName} (${resultKey})`);
    },
    [queryClient],
  );

  return {
    processToolResult,
    resetProcessedResults,
  };
}

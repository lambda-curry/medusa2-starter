import { Message, ToolPart } from '../../types';
import { QueryClient } from '@tanstack/react-query';

// Define the context object passed to handlers
export interface ToolHandlerContext {
  result: ToolPart;
  isStreamingMessage: boolean;
  message: Message;
  queryClient?: QueryClient;
}

// Define handler signature
export type ToolHandler = (context: ToolHandlerContext) => void | Promise<void>;

// Main registry for tool handlers
class ToolHandlerRegistry {
  private handlers: Map<string, ToolHandler[]> = new Map();
  private wildcardHandlers: ToolHandler[] = [];

  /**
   * Register a handler for a specific tool name
   * @param toolName The exact name of the tool to handle
   * @param handler The handler function
   */
  registerHandler(toolName: string, handler: ToolHandler): void {
    const existingHandlers = this.handlers.get(toolName) || [];
    this.handlers.set(toolName, [...existingHandlers, handler]);
  }

  /**
   * Register a handler for multiple tool names
   * @param toolNames Array of tool names to register for
   * @param handler The handler function
   */
  registerHandlerForMultiple(toolNames: string[], handler: ToolHandler): void {
    toolNames.forEach((toolName) => this.registerHandler(toolName, handler));
  }

  /**
   * Register a wildcard handler that processes every tool result
   * @param handler The handler function
   */
  registerWildcardHandler(handler: ToolHandler): void {
    this.wildcardHandlers.push(handler);
  }

  /**
   * Unregister a specific handler
   * @param toolName The tool name to unregister from
   * @param handler The handler to remove
   */
  unregisterHandler(toolName: string, handler: ToolHandler): void {
    const existingHandlers = this.handlers.get(toolName) || [];
    this.handlers.set(
      toolName,
      existingHandlers.filter((h) => h !== handler),
    );
  }

  /**
   * Execute all relevant handlers for a given tool result
   * @param context The tool handler context
   */
  async executeHandlers(context: ToolHandlerContext): Promise<void> {
    const { result } = context;
    const toolName = result.toolInvocation.toolName;

    if (!toolName) return;

    // Handle prefix matches (e.g., "update-" matches "update-product" and "update-inventory")
    const matchingKeys = Array.from(this.handlers.keys()).filter((key) => toolName.startsWith(key) || toolName === key);

    const handlerPromises: Promise<void>[] = [];

    // Run specific handlers
    for (const key of matchingKeys) {
      const handlers = this.handlers.get(key) || [];
      handlers.forEach((handler) => {
        const result = handler(context);
        if (result instanceof Promise) {
          handlerPromises.push(result);
        }
      });
    }

    // Run wildcard handlers
    this.wildcardHandlers.forEach((handler) => {
      const result = handler(context);
      if (result instanceof Promise) {
        handlerPromises.push(result);
      }
    });

    // Wait for all async handlers to complete
    if (handlerPromises.length > 0) {
      await Promise.all(handlerPromises);
    }
  }
}

// Export a singleton instance
export const toolHandlerRegistry = new ToolHandlerRegistry();

// Export common handler registration helpers
export const registerProductUpdateHandler = (handler: ToolHandler): void => {
  toolHandlerRegistry.registerHandlerForMultiple(['update-single-product'], handler);
};

export const registerProductCreateHandler = (handler: ToolHandler): void => {
  toolHandlerRegistry.registerHandlerForMultiple(['create-products'], handler);
};

export const registerInventoryHandler = (handler: ToolHandler): void => {
  toolHandlerRegistry.registerHandlerForMultiple(
    ['create-inventory-items', 'update-inventory-items', 'adjust-inventory-levels'],
    handler,
  );
};

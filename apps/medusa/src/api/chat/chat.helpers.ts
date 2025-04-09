import { MedusaResponse } from '@medusajs/framework';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { Request, Notification, Result } from '@modelcontextprotocol/sdk/types.js';
import { Tool, tool, ToolSet } from 'ai';
import { z } from 'zod';
import { toolRegistry, type ToolRegistry } from '../mcp/servers/medusa/tools/registry';
import { encode } from 'gpt-tokenizer';
import { ICacheService } from '@medusajs/framework/types';

// Define message type for better type checking
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

// Context window configuration parameters
export const CONTEXT_CONFIG = {
  // Maximum tokens to send to the LLM
  maxTokens: 10000,

  // Maximum number of messages to include (as a fallback)
  maxMessages: 10,

  // Token estimate for system prompt
  systemPromptTokens: 150,

  // Enable summarization for long conversations
  enableSummarization: true,

  // Minimum conversation length to trigger summarization
  summarizationThreshold: 15,

  // Maximum tokens for summary
  summaryMaxTokens: 250,

  // Whether to always include the most recent N messages
  alwaysIncludeLastN: 3,
};

// Client configuration
export const CLIENT_INFO = {
  name: 'MCP-AI-Client',
  version: '1.0.0',
} as const;

// Helper function to generate client capabilities from tool registry
export const generateClientCapabilities = (registry: ToolRegistry) => {
  const toolCapabilities: Record<string, unknown> = {};

  Object.entries(registry).forEach(([name, tool]) => {
    toolCapabilities[name] = {
      method: name,
      description: tool.description,
      parameters: tool.schema._def,
    };
  });

  return {
    experimental: { method: 'experimental' },
    sampling: { method: 'sampling' },
    tools: toolCapabilities,
  } as const;
};

// Generate client capabilities dynamically from registry
export const CLIENT_CAPABILITIES = generateClientCapabilities(toolRegistry);

// Helper function to create AI SDK tools from registry
export const createAiTools = (registry: ToolRegistry, client: Client<Request, Notification, Result>) => {
  const tools: Record<string, Tool> = {};

  Object.entries(registry).forEach(([name, mcpTool]) => {
    tools[name] = tool({
      description: mcpTool.description,
      parameters: mcpTool.schema,
      execute: async (args: z.infer<typeof mcpTool.schema>) => {
        try {
          const response = await client.callTool({
            name,
            arguments: args,
          });

          if (!response || typeof response !== 'object' || !Array.isArray((response as any).content)) {
            throw new Error('Invalid MCP response structure:');
          }

          const responseText = (response as any).content[0].text;
          let content;

          try {
            content = JSON.parse(responseText);
          } catch (parseError) {
            // If the response is not JSON, create a structured error response
            content = {
              error: true,
              message: responseText,
              details: {},
              toolName: name,
              failedArguments: args,
            };
          }

          // Check if the response contains an error
          if (content && typeof content === 'object' && 'error' in content) {
            return {
              error: true,
              message: content.message || 'An error occurred',
              details: content.details || {},
              toolName: name,
              failedArguments: args,
              suggestedFix: content.suggestedFix || null,
            };
          }

          return content;
        } catch (error) {
          // Extract error details for ToolExecutionError
          let errorDetails = {};
          if (error instanceof Error && 'details' in error) {
            const toolError = error as { details?: unknown };
            errorDetails = toolError.details || {};
          }

          // Format error details for the LLM
          const errorResponse = {
            error: true,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            details: errorDetails,
            toolName: name,
            failedArguments: args,
            suggestedFix: null,
          };

          // Return formatted error to LLM instead of throwing
          return errorResponse;
        }
      },
    });
  });

  return tools;
};

/**
 * Trims message history to fit within token limit
 * Prioritizes recent messages while maintaining conversation flow
 */
export function trimMessagesToFitContext(
  messages: ChatMessage[],
  maxTokens: number = CONTEXT_CONFIG.maxTokens,
): ChatMessage[] {
  if (!messages || messages.length === 0) return [];

  // Extract system message if present
  const systemMessages = messages.filter((m: ChatMessage) => m.role === 'system');
  const nonSystemMessages = messages.filter((m: ChatMessage) => m.role !== 'system');

  // Calculate tokens for system messages
  let systemTokens = 0;
  for (const msg of systemMessages) {
    systemTokens += encode(msg.content).length + 4; // Add overhead for message format
  }

  const availableTokens = maxTokens - systemTokens - CONTEXT_CONFIG.systemPromptTokens;

  // Sort non-system messages with most recent first
  const sortedMessages = [...nonSystemMessages].reverse();

  // Always include most recent N messages if configured
  const recentMessages = sortedMessages.slice(0, CONTEXT_CONFIG.alwaysIncludeLastN);
  const olderMessages = sortedMessages.slice(CONTEXT_CONFIG.alwaysIncludeLastN);

  // Calculate tokens for recent messages
  let tokenCount = 0;
  for (const msg of recentMessages) {
    tokenCount += encode(msg.content).length + 4;
  }

  // Keep older messages until we hit the token limit
  const keptOlderMessages: ChatMessage[] = [];

  for (const msg of olderMessages) {
    // Estimate token count (content + format overhead)
    const msgTokens = encode(msg.content).length + 4;

    if (tokenCount + msgTokens <= availableTokens) {
      keptOlderMessages.push(msg);
      tokenCount += msgTokens;
    } else {
      break; // Stop once we exceed the limit
    }
  }

  // Combine all parts: system messages + older kept messages + recent messages
  // Note: We need to reverse the kept messages to maintain chronological order
  return [...systemMessages, ...keptOlderMessages.reverse(), ...recentMessages.reverse()];
}

/**
 * Calculates approximate token count for a list of messages
 */
export function estimateTokenCount(messages: ChatMessage[]): number {
  if (!messages || messages.length === 0) return 0;

  let count = CONTEXT_CONFIG.systemPromptTokens; // Base count for system prompt

  for (const msg of messages) {
    count += encode(msg.content).length + 4; // Add 4 tokens for message format overhead
  }

  return count;
}

/**
 * Extended message schema that supports chat ID and single message mode
 */
export const extendedMessageSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
        id: z.string().optional(),
        name: z.string().optional(),
        tool_calls: z.array(z.any()).optional(),
        tool_call_id: z.string().optional(),
      }),
    )
    .optional(),
  id: z.string().optional(),
});

// Chat message schema
export const messageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ),
});

// Tool types
export type ProductTool = Tool<
  z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
  }>,
  string
>;

export interface ChatTools extends ToolSet {
  'fetch-products': ProductTool;
  [key: string]: Tool;
}

// Error handling utility
export const sendSSEError = (res: MedusaResponse, error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
  res.end();
};

/**
 * Redis key prefix for chat storage
 */
export const REDIS_CHAT_KEY_PREFIX = 'medusa:chat:';

/**
 * Prunes old messages to keep chat history manageable
 * Preserves system messages and keeps only the most recent messages
 */
export function pruneOldMessages(messages: ChatMessage[], maxMessages = 100): ChatMessage[] {
  if (messages.length <= maxMessages) return messages;

  // Keep system messages and the most recent messages
  const systemMessages = messages.filter((m) => m.role === 'system');
  const nonSystemMessages = messages.filter((m) => m.role !== 'system');

  // Keep only the most recent non-system messages
  const recentMessages = nonSystemMessages.slice(-maxMessages);

  return [...systemMessages, ...recentMessages];
}

/**
 * Save chat history to Redis
 */
export async function saveChat(
  cacheService: ICacheService,
  { chatId, messages }: { chatId: string; messages: ChatMessage[] },
): Promise<void> {
  try {
    // Prune messages to keep only the latest 100 (plus system messages)
    const prunedMessages = pruneOldMessages(messages, 100);

    const redisKey = `${REDIS_CHAT_KEY_PREFIX}${chatId}`;
    const jsonData = JSON.stringify(prunedMessages);

    await cacheService.set(
      redisKey,
      jsonData,
      60 * 60 * 24 * 7, // 7 days
    );

    // Verify it was saved
    const verifyData = await cacheService.get(redisKey);

    if (!verifyData) {
      throw new Error(`Failed to verify saved chat data with key: ${redisKey}`);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Load chat history from Redis
 */
export async function loadChat(cacheService: ICacheService, chatId: string): Promise<ChatMessage[]> {
  try {
    const redisKey = `${REDIS_CHAT_KEY_PREFIX}${chatId}`;

    const chatData = await cacheService.get(redisKey);
    if (chatData) {
      try {
        const messages = JSON.parse(chatData as string);
        return messages;
      } catch (parseError) {
        return [];
      }
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

// TODO: not sure how to do this with the cache service
// /**
//  * List available chats for a user
//  * Optional implementation if you want to show users their previous chats
//  */
// export async function listChats(cacheService: ICacheService, userId?: string): Promise<string[]> {
//   if (!cacheService) {
//     return [];
//   }

//   try {
//     // Get all chat keys
//     const pattern = userId ? `${REDIS_CHAT_KEY_PREFIX}${userId}:*` : `${REDIS_CHAT_KEY_PREFIX}*`;

//     const keys = await cacheService.(pattern);

//     // Extract chatIds from keys
//     return keys.map((key: string) => key.replace(REDIS_CHAT_KEY_PREFIX, ''));
//   } catch (error) {
//     console.error('Failed to list chats:', error);
//     return [];
//   }
// }

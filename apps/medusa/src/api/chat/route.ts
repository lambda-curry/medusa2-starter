import { type MedusaRequest, type MedusaResponse } from '@medusajs/framework';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { appendResponseMessages, Message, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NoSuchToolError, InvalidToolArgumentsError, ToolExecutionError } from 'ai';
import type { Request, Notification, Result } from '@modelcontextprotocol/sdk/types.js';
import { Modules } from '@medusajs/framework/utils';
import {
  createAiTools,
  sendSSEError,
  trimMessagesToFitContext,
  estimateTokenCount,
  extendedMessageSchema,
  loadChat,
  saveChat,
  CONTEXT_CONFIG,
  type ChatMessage,
  CLIENT_INFO,
  CLIENT_CAPABILITIES,
  REDIS_CHAT_KEY_PREFIX,
} from './chat.helpers';
import { MCP_MODULE } from '../mcp';
import { toolRegistry } from '../mcp/servers/medusa/tools/registry';
import { ICacheService } from '@medusajs/framework/types';
import { researchTool } from './tools/perplexity';
import { generateObject } from 'ai';

// Cookie name for storing the current chat ID
const CURRENT_CHAT_COOKIE = 'medusa_current_chat_id';
// Cookie expiration (7 days)
const COOKIE_EXPIRY_DAYS = 7;

/**
 * POST /chat
 *
 * Handles AI chat requests using the AI SDK with OpenAI integration.
 * Uses MCP client for tool execution.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    // Parse the request body based on the extended schema
    // This handles both full message array and single message with chatId
    const { messages: incomingMessages, id: chatIdFromRequest } = extendedMessageSchema.parse(req.body);

    // Check for a chat ID in cookie if not provided in the request
    const chatIdFromCookie = req.cookies[CURRENT_CHAT_COOKIE];

    // Set up SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Get MCP service and ensure transport is ready
    const mcpService = req.scope.resolve(MCP_MODULE);
    await mcpService.setRequestContext(req);
    const cacheService = req.scope.resolve(Modules.CACHE);

    // Create transport for MCP server connection
    const transport = new SSEClientTransport(new URL('/mcp/sse', req.protocol + '://' + req.get('host')), {
      requestInit: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    });

    // Initialize MCP client
    const client = new Client<Request, Notification, Result>(CLIENT_INFO, {
      capabilities: CLIENT_CAPABILITIES,
    });

    // Connect client to transport
    await client.connect(transport);

    // Ensure OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Decide which chat ID to use:
    // 1. ID from request (highest priority)
    // 2. ID from cookie (if available and no ID in request)
    // 3. Generate a new ID if none of the above are available
    const chatId = chatIdFromRequest || chatIdFromCookie;
    const currentChatId = chatId || `chat_${Date.now()}`;

    // Set the chat ID cookie (refresh expiry even for existing chats)
    const cookieExpiry = new Date();
    cookieExpiry.setDate(cookieExpiry.getDate() + COOKIE_EXPIRY_DAYS);
    res.cookie(CURRENT_CHAT_COOKIE, currentChatId, {
      expires: cookieExpiry,
      httpOnly: true,
      sameSite: 'strict',
    });

    // Load existing messages if chatId is provided
    let fullMessages: ChatMessage[] = [];

    if (chatId) {
      try {
        const existingMessages = await loadChat(cacheService, chatId);
        fullMessages = existingMessages;
      } catch (error) {
        // Failed to load existing chat, continue with empty messages
        console.error('[POST /chat] Failed to load existing chat:', error);
      }
    }

    // Append new messages, if any, to the loaded or empty array.
    if (incomingMessages) {
      fullMessages = fullMessages.concat(incomingMessages);
    }

    const mcpTools = createAiTools(toolRegistry, client);
    const tools = {
      ...mcpTools,
      research: researchTool,
    };

    const trimmedMessages = trimMessagesToFitContext(fullMessages, CONTEXT_CONFIG.maxTokens);

    // Stream the response back to the client
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: trimmedMessages,
      system:
        'You are an e-commerce assistant for an admin tool called Medusa. Do not guess or make up information, use the tools provided to fetch the correct parameters that you need to complete the task.',
      tools,
      maxSteps: 10,
      experimental_continueSteps: true,
      toolCallStreaming: true,
      experimental_telemetry: { isEnabled: true },
      experimental_repairToolCall: async ({ toolCall, tools, error, parameterSchema }) => {
        // Keep our detailed logging
        console.error('[RepairToolCall] Failed tool call details:', JSON.stringify(toolCall, null, 2));
        console.error('[RepairToolCall] Error object:', error);

        // Only attempt repair if the error is not due to a misnamed tool
        if (NoSuchToolError.isInstance(error)) return null;

        const tool = tools[toolCall.toolName as keyof typeof tools];
        if (!tool) return null;

        try {
          // Parse the current args
          const currentArgs = JSON.parse(toolCall.args);

          // Special handling for create-products validation errors
          if (toolCall.toolName === 'create-products' && error.message.includes('product options')) {
            // Extract the option title from the error message
            const optionMatch = error.message.match(/product options: ([^.]+)/);
            if (optionMatch) {
              const optionTitle = optionMatch[1];

              // Find the option values from the product options
              const product = currentArgs.products[0];
              const option = product.options?.find((opt: any) => opt.title === optionTitle);

              if (option) {
                // Add the missing options to each variant
                product.variants = product.variants.map((variant: any) => ({
                  ...variant,
                  options: {
                    ...variant.options,
                    [optionTitle]: variant.title.split(' / ')[0], // Extract option value from variant title
                  },
                }));

                return {
                  toolCallType: 'function' as const,
                  toolCallId: toolCall.toolCallId,
                  toolName: toolCall.toolName,
                  args: JSON.stringify(currentArgs),
                };
              }
            }
          }

          // For other cases, try using generateObject with a simplified schema
          const { object: repairedArgs } = await generateObject({
            model: openai('gpt-4o', { structuredOutputs: true }),
            schema: tool.parameters,
            prompt: [
              `The model tried to call the tool "${toolCall.toolName}" with the following arguments:`,
              JSON.stringify(toolCall.args, null, 2),
              `The tool accepts the following schema:`,
              JSON.stringify(parameterSchema(toolCall), null, 2),
              `The call failed with error: ${error.message}`,
              'Please fix the arguments to match the schema exactly.',
            ].join('\n'),
          });

          console.log('[RepairToolCall] Generated repaired arguments:', JSON.stringify(repairedArgs, null, 2));

          return {
            toolCallType: 'function' as const,
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            args: JSON.stringify(repairedArgs),
          };
        } catch (repairError) {
          console.error('[RepairToolCall] Failed to repair tool call:', repairError);
          return null;
        }
      },
      providerOptions: {
        openai: {
          apiKey,
        },
      },
      onFinish: async ({ response }) => {
        try {
          // Important: Append to FULL messages history, not just trimmed context
          const updatedMessages = appendResponseMessages({
            messages: fullMessages as Message[],
            responseMessages: response.messages,
          });

          // Save complete history to Redis
          await saveChat(cacheService, {
            chatId: currentChatId,
            messages: updatedMessages as unknown as ChatMessage[],
          });

          // Also update the chat index
          await updateChatIndex(cacheService, currentChatId);
        } catch (error) {
          // Failed to save chat
          console.error('[POST /chat:onFinish] Failed to save chat:', error);
        }
      },
    });

    // Handle client disconnect
    req.on('close', () => {
      if (transport) {
        transport.close().catch((error) => {
          console.error('Transport close error:', error);
        });
      }
    });

    // Stream the response using AI SDK's helper
    result.pipeDataStreamToResponse(res);
  } catch (error) {
    sendSSEError(res, error);
    console.error('Error in chat route:', error);
  }
}

/**
 * Update the chat index with a new chat ID
 */
async function updateChatIndex(cacheService: ICacheService, chatId: string): Promise<void> {
  try {
    const indexKey = `${REDIS_CHAT_KEY_PREFIX}index`;
    const existingIndex = await cacheService.get(indexKey);

    let chatIds: string[] = [];
    if (existingIndex) {
      try {
        chatIds = JSON.parse(existingIndex as string);
      } catch (parseError) {
        // Failed to parse existing index
        console.error(`[updateChatIndex] Failed to parse existing index:`, parseError);
      }
    }

    // Only add the chat ID if it's not already in the index
    if (!chatIds.includes(chatId)) {
      chatIds.push(chatId);
      const jsonData = JSON.stringify(chatIds);
      await cacheService.set(indexKey, jsonData);
    }
  } catch (error) {
    // Failed to update chat index
    console.error('[updateChatIndex] Failed to update chat index:', error);
  }
}

/**
 * GET /api/chat
 * List available chats
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    // Get cache service
    const cacheService = req.scope.resolve(Modules.CACHE);

    // Get the chat index
    const indexKey = `${REDIS_CHAT_KEY_PREFIX}index`;
    const chatIndex = await cacheService.get(indexKey);

    // Get current chat ID from cookie
    let currentChatId = req.cookies[CURRENT_CHAT_COOKIE];

    // If no chat ID in cookie, create a new one
    if (!currentChatId) {
      currentChatId = `chat_${Date.now()}`;

      // Set the chat ID cookie
      const cookieExpiry = new Date();
      cookieExpiry.setDate(cookieExpiry.getDate() + COOKIE_EXPIRY_DAYS);
      res.cookie(CURRENT_CHAT_COOKIE, currentChatId, {
        expires: cookieExpiry,
        httpOnly: true,
        sameSite: 'strict',
      });
    }

    // Load messages for the current chat if it exists
    let currentChatMessages: ChatMessage[] = [];

    try {
      // Check if the chat exists in Redis
      const redisKey = `${REDIS_CHAT_KEY_PREFIX}${currentChatId}`;
      const chatExists = await cacheService.get(redisKey);

      if (chatExists) {
        // Chat exists, load messages
        currentChatMessages = await loadChat(cacheService, currentChatId);
      } else {
        // Chat doesn't exist, create a welcome message
        // Create a welcome message
        const welcomeMessage: ChatMessage = {
          role: 'assistant',
          content: 'Welcome to Medusa AI Chat! How can I help you today?',
          id: `msg_${Date.now()}`,
        };

        currentChatMessages = [welcomeMessage];

        // Save the welcome message to Redis
        await saveChat(cacheService, {
          chatId: currentChatId,
          messages: currentChatMessages,
        });

        // Update the chat index
        await updateChatIndex(cacheService, currentChatId);
      }
    } catch (loadError) {
      // Failed to load messages for current chat
      console.error(`[GET /api/chat] Failed to load messages for current chat:`, loadError);
    }

    if (chatIndex) {
      try {
        const chatIds = JSON.parse(chatIndex as string);

        // Include the current chat ID and messages in the response
        res.json({
          chats: chatIds,
          currentChatId,
          messages: currentChatMessages,
        });
      } catch (parseError) {
        console.error(`[GET /api/chat] Failed to parse chat index:`, parseError);
        res.status(500).json({ error: 'Failed to parse chat index' });
      }
    } else {
      // No chats found
      res.json({
        chats: [],
        currentChatId,
        messages: currentChatMessages,
      });
    }
  } catch (error) {
    console.error('[GET /api/chat] Error listing chats:', error);
    res.status(500).json({ error: 'Failed to list chats' });
  }
}

/**
 * DELETE /api/chat
 * Clear the current chat (used for "New Chat" functionality)
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    // Clear the current chat cookie by setting an expired date
    res.cookie(CURRENT_CHAT_COOKIE, '', {
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'strict',
    });

    res.status(200).json({ success: true, message: 'Current chat cleared' });
  } catch (error) {
    console.error('[DELETE /api/chat] Error clearing current chat:', error);
    res.status(500).json({ error: 'Failed to clear current chat' });
  }
}

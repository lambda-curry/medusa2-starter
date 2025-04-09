import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { Request, Result, Notification, ServerCapabilities } from '@modelcontextprotocol/sdk/types.js';

const TEST_SERVER_URL = 'http://localhost:9000/mcp/sse';
const MAX_CONNECTION_ATTEMPTS = 10;
const CONNECTION_CHECK_INTERVAL = 1000;

export interface TestContext {
  client: Client<Request, Notification, Result>;
  getServerCapabilities: () => ServerCapabilities | undefined;
  getServerVersion: () => { name: string; version: string } | undefined;
}

export const useTestClient = () => {
  let client: Client<Request, Notification, Result>;
  let transport: SSEClientTransport;

  beforeAll(async () => {
    try {
      const clientInfo = {
        name: 'MCP-Test-Client',
        version: '1.0.0',
      };

      client = new Client<Request, Notification, Result>(clientInfo, {
        capabilities: {
          experimental: {
            method: 'experimental',
          },
          sampling: {
            method: 'sampling',
          },
          tools: {
            'fetch-products': {
              method: 'fetch-products',
              description: 'Fetch products from the database',
              parameters: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'Search query to filter products' },
                  limit: {
                    type: 'number',
                    minimum: 1,
                    maximum: 100,
                    default: 10,
                    description: 'Maximum number of products to return',
                  },
                  offset: {
                    type: 'number',
                    minimum: 0,
                    default: 0,
                    description: 'Number of products to skip',
                  },
                },
                additionalProperties: false,
              },
            },
            'chat-message': {
              method: 'chat-message',
              description: 'Send a chat message and get a response',
              parameters: {
                type: 'object',
                properties: {
                  message: { type: 'string', description: 'The message to send' },
                  context: {
                    type: 'object',
                    description: 'Additional context for the chat',
                    properties: {
                      history: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            role: { type: 'string', enum: ['user', 'assistant'] },
                            content: { type: 'string' },
                          },
                        },
                      },
                    },
                    additionalProperties: true,
                  },
                },
                required: ['message'],
                additionalProperties: false,
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('Error during test client initialization:', error);
      throw error;
    }
  });

  beforeEach(() => {
    // Create a new transport for each test
    transport = new SSEClientTransport(new URL(TEST_SERVER_URL), {
      requestInit: {
        headers: {
          'Content-Type': 'text/event-stream',
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      },
    });
  });

  afterEach(async () => {
    if (transport) {
      try {
        // Close the transport
        await transport.close();
        // Wait a bit to ensure complete cleanup
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error during transport cleanup:', error);
      }
    }
  });

  afterAll(async () => {
    if (transport) {
      try {
        await transport.close();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error during transport cleanup:', error);
      }
      try {
        if (client) {
          await client.close();
        }
      } catch (error) {
        console.error('Error during client cleanup:', error);
      }
    }
  });

  const getClient = () => client;
  const getTransport = () => transport;

  // Helper that encapsulates the repeated client connection logic
  const connectTestClient = async () => {
    const currentClient = getClient();
    const currentTransport = getTransport();

    // Close any existing transport
    try {
      await currentTransport.close();
    } catch (error) {
      // Ignore close errors
    }

    // Create a new transport
    transport = new SSEClientTransport(new URL(TEST_SERVER_URL), {
      requestInit: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    });

    await currentClient.connect(transport);
    await waitForSSEConnection(currentClient);
    return { client: currentClient, transport };
  };

  return {
    getClient,
    getTransport,
    connectTestClient,
  };
};
// Helper to wait for SSE connection with proper typing and error handling
export const waitForSSEConnection = async (client: Client<Request, Notification, Result>): Promise<void> => {
  const timeout = MAX_CONNECTION_ATTEMPTS * CONNECTION_CHECK_INTERVAL;
  const startTime = Date.now();
  let lastError: string | null = null;

  while (Date.now() - startTime < timeout) {
    try {
      const capabilities = client.getServerCapabilities();
      if (capabilities) return;

      // Add exponential backoff
      const attempt = Math.floor((Date.now() - startTime) / CONNECTION_CHECK_INTERVAL);
      const delay = Math.min(1000 * Math.pow(1.5, attempt), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      lastError = errorMessage;
      if (error instanceof Error && 'code' in error && error.code === 'ECONNRESET') {
        console.warn('Connection reset, retrying...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Failed to establish SSE connection after max attempts. Last error: ${lastError || 'unknown'}`);
};

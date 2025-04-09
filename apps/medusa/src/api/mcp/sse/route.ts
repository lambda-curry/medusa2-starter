import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import McpService from '../service';
import { MCP_MODULE } from '..';

// Store the active transport and its session ID
let activeTransport: SSEServerTransport | null = null;
let activeSessionId: string | null = null;

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    // Set standard SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    // Get the session ID from the query params
    const sessionId = req.query.sessionId as string;

    // Initialize transport using SDK's SSEServerTransport
    const transport = new SSEServerTransport('/mcp/messages', res);

    // Get MCP service and set request context
    const mcpService = req.scope.resolve<McpService>(MCP_MODULE);
    await mcpService.setRequestContext(req);
    const mcpServer = await mcpService.getServer();

    // Connect transport to MCP server
    await mcpServer.connect(transport);

    // Only close existing transport if it's for a different session
    if (activeTransport && activeSessionId && activeSessionId !== sessionId) {
      console.log(`Closing transport for session ${activeSessionId} (new session: ${sessionId})`);
      activeTransport.close();
      activeTransport = null;
      activeSessionId = null;
    }

    // Store the new transport as active
    activeTransport = transport;
    activeSessionId = sessionId;

    // Handle client disconnect
    req.on('close', () => {
      console.log(`Client disconnected for session ${sessionId}`);
      if (activeTransport === transport && activeSessionId === sessionId) {
        console.log('Cleaning up transport for disconnected session');
        activeTransport = null;
        activeSessionId = null;
      }
      transport.close();
    });

    // Handle errors
    req.on('error', (error) => {
      console.error(`SSE connection error for session ${sessionId}:`, error);
      if (activeTransport === transport && activeSessionId === sessionId) {
        console.log('Cleaning up transport after error');
        activeTransport = null;
        activeSessionId = null;
      }
      transport.close();
    });
  } catch (error) {
    console.error('SSE connection error:', error);
    activeTransport = null;
    activeSessionId = null;
    res.status(500).json({
      error: 'Failed to establish SSE connection',
      code: 'SSE_CONNECTION_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
}

// Export function to get the active transport
export function getActiveTransport(): SSEServerTransport | null {
  return activeTransport;
}

// Export function to get/set the active session ID
export function getActiveSessionId(): string | null {
  return activeSessionId;
}

export function setActiveSessionId(sessionId: string): void {
  activeSessionId = sessionId;
}

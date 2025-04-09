import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { getActiveTransport } from '../sse/route';

// JSON-RPC 2.0 error codes
const ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  try {
    // Get the active transport
    const transport = getActiveTransport();
    if (!transport) {
      console.error('No active transport found for session:', req.query.sessionId);
      throw new Error('No active transport found');
    }

    // Handle the message
    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP message:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : ('Internal server error' as const),
        },
      });
    }
  }
}

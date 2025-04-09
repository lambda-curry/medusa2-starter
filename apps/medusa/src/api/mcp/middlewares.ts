import type { NextFunction } from 'express';
import cors from 'cors';
import { json } from 'express';
import { MedusaRequest, MedusaResponse, type MiddlewareRoute } from '@medusajs/framework';

// SSE headers middleware
const sseHeaders = (req: MedusaRequest, res: MedusaResponse, next: NextFunction) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  next();
};

// Request logging middleware
const logRequest = (req: MedusaRequest, res: MedusaResponse, next: NextFunction) => {
  console.log(`MCP ${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
  });
  next();
};

// Define middleware for SSE endpoint
export const storeProductMcpRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/mcp/sse',
    method: 'GET',
    middlewares: [cors(), sseHeaders, logRequest],
  },
  {
    matcher: '/mcp/messages',
    method: 'POST',
    middlewares: [cors(), json(), logRequest],
  },
];

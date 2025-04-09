import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { Logger } from '@medusajs/types';
import { toolRegistry } from './tools/registry';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

export const productSchema = z.object({
  query: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
});

export type ProductArgs = z.infer<typeof productSchema>;

export class MedusaMcpServer {
  private mcpServer_: McpServer;
  private logger_: Logger;
  private transport_: SSEServerTransport | null = null;
  private req_: Request | null = null;

  constructor({ logger }: { logger: Logger }) {
    this.logger_ = logger;
    this.mcpServer_ = new McpServer({
      name: 'Medusa MCP',
      version: '1.0.0',
      capabilities: {
        tools: Object.fromEntries(
          Object.entries(toolRegistry).map(([name, tool]) => [
            name,
            {
              name: tool.name,
              description: tool.description,
              parameters: {
                type: 'object',
                properties: tool.schema.shape,
                additionalProperties: false,
              },
            },
          ]),
        ),
      },
    });

    this.registerTools();
  }

  private registerTools() {
    Object.entries(toolRegistry).forEach(([name, tool]) => {
      // @ts-ignore // TODO: figure out how to type this better
      this.mcpServer_.tool(name, tool.schema.shape, async (args: z.infer<typeof tool.schema>) => {
        return tool.execute(args as any, { req: this.req_, logger: this.logger_ });
      });
    });
  }

  public async handleRequest(req: Request & { res: Response }): Promise<void> {
    if (!this.transport_) {
      this.transport_ = new SSEServerTransport('/mcp/messages', req.res);
      await this.mcpServer_.connect(this.transport_);
    }
    await this.transport_.handlePostMessage(req, req.res, req.body);
  }

  public setRequestContext(req: Request) {
    this.req_ = req;
  }

  public getServer(): McpServer {
    return this.mcpServer_;
  }
}

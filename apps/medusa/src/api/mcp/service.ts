import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { Request } from 'express';
import { MedusaService } from '@medusajs/framework/utils';
import { Logger } from '@medusajs/types';
import { MedusaMcpServer } from './servers/medusa/MedusaMcpServer';
import { register } from '../chat/instrumentation';

export const productSchema = z.object({
  query: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
});

export type ProductArgs = z.infer<typeof productSchema>;

type InjectedDependencies = {
  logger: Logger;
};

class McpService extends MedusaService({}) {
  protected readonly logger_: Logger;
  private medusaMcpServer_: MedusaMcpServer;

  constructor({ logger }: InjectedDependencies) {
    super(...arguments);
    this.logger_ = logger;
    this.medusaMcpServer_ = new MedusaMcpServer({ logger });
    this.initialize().catch((error) => {
      this.logger_.error(
        `[MCP Module] Failed to initialize telemetry: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
  }

  private async initialize(): Promise<void> {
    try {
      // Register telemetry
      await register();
      this.logger_.info('[MCP Module] Service and telemetry initialized successfully');
    } catch (error) {
      this.logger_.error(
        `[MCP Module] Telemetry initialization failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Continue with service initialization even if telemetry fails
      this.logger_.info('[MCP Module] Service initialized successfully');
    }
  }

  async getServer(): Promise<McpServer> {
    return this.medusaMcpServer_.getServer();
  }

  async setRequestContext(req: Request): Promise<void> {
    this.medusaMcpServer_.setRequestContext(req);
  }
}

export default McpService;

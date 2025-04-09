import type { z } from 'zod';
import type { Request } from 'express';
import type { Logger } from '@medusajs/types';
import { remoteQueryObjectFromString } from '@medusajs/framework/utils';
import type { IProductModuleService } from '@medusajs/framework/types';

export type ProductModuleService = IProductModuleService;

export interface McpToolContext {
  req: Request | null;
  logger: Logger;
}

export interface QueryResult<T> {
  rows: T[];
  metadata: {
    count: number;
    skip: number;
    take: number;
  };
}

export type RemoteQueryFn = <T>(query: ReturnType<typeof remoteQueryObjectFromString>) => Promise<QueryResult<T>>;

export class ToolExecutionError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}

export interface ToolContext {
  req?: Request;
  logger: Logger;
}

export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export interface McpTool<T extends z.ZodType> {
  name: string;
  description: string;
  schema: T;
  execute: (args: z.infer<T>, context: ToolContext) => Promise<ToolResponse>;
}

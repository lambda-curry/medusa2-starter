import { LoaderOptions } from '@medusajs/framework/types';
import { asClass } from 'awilix';
import McpService from '../service';
import { ContainerRegistrationKeys } from '@medusajs/utils';
import type { Logger } from '@medusajs/types';
import { MCP_MODULE } from '..';

export default async function mcpServerLoader({ container }: LoaderOptions): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);

  try {
    container.register({
      [MCP_MODULE]: asClass(McpService)
        .singleton()
        .inject((injectedDependencies: Record<string, any>) => ({
          logger: injectedDependencies[ContainerRegistrationKeys.LOGGER],
        })),
    });

    logger.info('[MCP Module] Loader initialized');
  } catch (error) {
    logger.error(`[MCP Module] Failed to initialize: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

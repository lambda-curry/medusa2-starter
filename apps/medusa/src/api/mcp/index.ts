import { Module } from '@medusajs/framework/utils';
import mcpServerLoader from './loaders/mcp-server';
import McpService from './service';

export const MCP_MODULE = 'mcpService';

export default Module(MCP_MODULE, {
  service: McpService,
  loaders: [mcpServerLoader],
});

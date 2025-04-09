# Transports in MCP

## Overview

Transports in the Model Context Protocol (MCP) provide the foundation for communication between clients and servers. A transport handles the underlying mechanics of sending and receiving messages, ensuring that MCP protocol messages are correctly converted for transmission and interpreted upon receipt.

## Message Format

MCP uses JSON-RPC 2.0 as its wire format. The transport layer is responsible for converting MCP protocol messages into JSON-RPC format for transmission, and converting received JSON-RPC messages back into MCP protocol messages.

There are three types of JSON-RPC messages used:

### Requests

```json
{
  "jsonrpc": "2.0",
  "id": "number | string",
  "method": "string",
  "params": { /* optional object */ }
}
```

### Responses

```json
{
  "jsonrpc": "2.0",
  "id": "number | string",
  "result": { /* optional object */ },
  "error": {
    "code": "number",
    "message": "string",
    "data": "unknown (optional)"
  }
}
```

### Notifications

```json
{
  "jsonrpc": "2.0",
  "method": "string",
  "params": { /* optional object */ }
}
```

## Built-in Transport Types

### Standard Input/Output (stdio)

The stdio transport enables communication through standard input and output streams, making it particularly useful for local integrations and command-line tools.

**Use stdio when:**
- Building command-line tools
- Implementing local integrations
- Needing simple process communication
- Working with shell scripts

**Example (TypeScript):**

```typescript
import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';

const server = new Server({
  name: 'example-server',
  version: '1.0.0'
}, { capabilities: {} });

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Server-Sent Events (SSE)

SSE transport enables server-to-client streaming with HTTP endpoints, using POST requests for client-to-server communication.

**Use SSE when:**
- Only server-to-client streaming is needed
- Working with restricted networks
- Implementing simple update mechanisms

**Example (Express with TypeScript):**

```typescript
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse';

const app = express();

const server = new Server({
  name: 'example-server',
  version: '1.0.0'
}, { capabilities: {} });

let transport: SSEServerTransport | null = null;

app.get('/sse', (req, res) => {
  transport = new SSEServerTransport('/messages', res);
  server.connect(transport);
});

app.post('/messages', (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  }
});

app.listen(3000);
```

## Custom Transports

MCP makes it easy to implement custom transports for specific needs. Any transport implementation just needs to conform to the following interface:

```typescript
interface Transport {
  // Start processing messages
  start(): Promise<void>;

  // Send a JSON-RPC message
  send(message: JSONRPCMessage): Promise<void>;

  // Close the connection
  close(): Promise<void>;

  // Optional callbacks
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;
}
```

Custom transports can be used for:
- Custom network protocols
- Specialized communication channels
- Integration with existing systems
- Performance optimization

## Error Handling

Transport implementations should robustly handle error scenarios including:

- Connection errors
- Message parsing errors
- Protocol errors
- Network timeouts

**Example Error Handling in TypeScript:**

```typescript
class ExampleTransport implements Transport {
  async start() {
    try {
      // Connection logic
    } catch (error) {
      this.onerror?.(new Error(`Failed to connect: ${error}`));
      throw error;
    }
  }

  async send(message: JSONRPCMessage) {
    try {
      // Sending logic
    } catch (error) {
      this.onerror?.(new Error(`Failed to send message: ${error}`));
      throw error;
    }
  }

  async close() {
    // Cleanup logic
  }
}
```

## Best Practices

- Handle the connection lifecycle properly.
- Implement robust error handling and clean up resources on connection close.
- Use appropriate timeouts and validate messages before sending.
- Log transport events for debugging purposes.
- Implement reconnection logic when necessary and handle backpressure in message queues.

## Security Considerations

When implementing transport:

- **Authentication and Authorization:**
  - Implement proper client authentication, validate credentials, and use secure token handling.
  - Enforce authorization checks as required.
- **Data Security:**
  - Use TLS for network transport.
  - Encrypt sensitive data and validate message integrity.
  - Implement message size limits and sanitize input data.
- **Network Security:**
  - Apply rate limiting and use appropriate timeouts.
  - Handle denial of service scenarios and monitor for unusual patterns.

## Debugging Transport

- Enable debug logging to monitor message flow and connection states.
- Validate message formats and test error scenarios.
- Use network analysis tools and implement regular health checks for connections.

---

This document outlines the core concepts, usage patterns, and best practices for MCP transports, ensuring reliable and secure communication between clients and servers. 
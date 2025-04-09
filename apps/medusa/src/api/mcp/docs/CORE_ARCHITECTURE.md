# Core Architecture and Concepts

## Overview

The Model Context Protocol (MCP) is built on a flexible, extensible architecture that enables seamless communication between Large Language Model (LLM) applications and integrations. MCP follows a client-server architecture where:

- **Hosts** are LLM applications (e.g., Claude Desktop, IDEs) that initiate connections.
- **Clients** maintain 1:1 connections with servers within the host application.
- **Servers** provide context, tools, and prompts to clients.

## Server Process

The server process consists of several layers:

- **Host Layer:** The LLM application that initiates connections.
- **Transport Layer:** Manages communication between clients and servers.
- **MCP Client and MCP Server:** Handle protocol messages, context delivery, and command execution.

## Core Components

### Protocol Layer

The protocol layer handles high-level communication, including message framing, request/response linking, and establishing communication patterns. Key responsibilities include:

- Handling incoming requests and notifications.
- Sending requests and awaiting responses.
- Sending one-way notifications.

**Example (TypeScript):**

```typescript
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';


class Protocol<Request, Notification, Result> {
  // Handle incoming requests
  setRequestHandler<T>(schema: T, handler: (request: T, extra: RequestHandlerExtra) => Promise<Result>): void { }
  
  // Handle incoming notifications
  setNotificationHandler<T>(schema: T, handler: (notification: T) => Promise<void>): void { }
  
  // Send requests and await responses
  request<T>(request: Request, schema: T, options?: RequestOptions): Promise<T> { return Promise.resolve({} as T); }
  
  // Send one-way notifications
  notification(notification: Notification): Promise<void> { return Promise.resolve(); }
}
```

Key classes typically include:

- **Protocol**
- **Client**
- **Server**

### Transport Layer

The transport layer is responsible for the actual exchange of messages between clients and servers. MCP supports multiple transport mechanisms:

- **Stdio Transport:** Uses standard input/output, ideal for local process communication.
- **HTTP with SSE Transport:** Uses Server-Sent Events for server-to-client messages and HTTP POST for client-to-server messages.

All transports use JSON-RPC 2.0 to exchange messages.

### Message Types

MCP defines several message types:

- **Request:** Expects a response. Example:

```typescript
interface Request {
  method: string;
  params?: Record<string, unknown>;
}
```

- **Result:** A successful response to a request. Example:

```typescript
interface Result {
  [key: string]: unknown;
}
```

- **Error:** Indicates that a request failed. Example:

```typescript
interface Error {
  code: number;
  message: string;
  data?: unknown;
}
```

- **Notification:** A one-way message without an expected response. Example:

```typescript
interface Notification {
  method: string;
  params?: Record<string, unknown>;
}
```

### Connection Lifecycle

1. **Initialization:**
   - The client sends an initialize request with protocol version and capabilities.
   - The server responds with its protocol version and capabilities.
   - The client sends an acknowledgment via a notification.

2. **Message Exchange:**
   - **Request-Response:** Both client and server can send requests and handle responses.
   - **Notifications:** Either party sends one-way messages.

3. **Termination:**
   - A clean shutdown via close(), or due to transport disconnection or error conditions.

### Error Handling

MCP utilizes standard JSON-RPC error codes:

```typescript
enum ErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603
}
```

Errors are propagated through error responses to requests, error events on transports, and protocol-level error handlers.

## Implementation Example

Below is a basic example of setting up an MCP server in TypeScript:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "example-server",
  version: "1.0.0"
});

// Set a request handler
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "example://resource",
        name: "Example Resource"
      }
    ]
  };
});

// Connect transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Best Practices

- **Transport Selection:**
  - Use Stdio transport for local processes.
  - Use HTTP with SSE for remote communications with proper security considerations.

- **Message Handling:**
  - Validate inputs and use type-safe schemas.
  - Implement error handling and timeouts.

- **Security:**
  - Use TLS for remote connections and implement authentication.
  - Validate and sanitize all incoming messages.

## Debugging and Monitoring

- Log protocol events and errors.
- Monitor connection status and performance.
- Implement health checks and track resource usage.

## Conclusion

This document outlines the core architecture and concepts of MCP, detailing how clients, servers, and LLMs interact. Using this framework, developers can build scalable and resilient integrations that meet the diverse needs of modern LLM applications. 
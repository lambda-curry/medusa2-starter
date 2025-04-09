# MCP TypeScript SDK Documentation

This document provides information on how to use the MCP TypeScript SDK to build MCP servers and clients, based on the official documentation from Model Context Protocol.

## Table of Contents
- [Overview](#overview)
- [Installation](#installation)
- [Quickstart](#quickstart)
- [What is MCP?](#what-is-mcp)
- [Core Concepts](#core-concepts)
  - [Server](#server)
  - [Resources](#resources)
  - [Tools](#tools)
  - [Prompts](#prompts)
- [Running Your Server](#running-your-server)
  - [stdio](#stdio)
  - [HTTP with SSE](#http-with-sse)
- [Testing and Debugging](#testing-and-debugging)
- [Examples](#examples)
  - [Echo Server](#echo-server)
  - [SQLite Explorer](#sqlite-explorer)
- [Advanced Usage](#advanced-usage)
- [Writing MCP Clients](#writing-mcp-clients)
- [Documentation and License](#documentation-and-license)
- [Server-Sent Events (SSE) Transport](#server-sent-events-sse-transport)
  - [Basic SSE Setup](#basic-sse-setup)
  - [Important Notes](#important-notes)
  - [Example Implementation](#example-implementation)
  - [Error Handling](#error-handling)

## Overview

The MCP TypeScript SDK implements the full Model Context Protocol (MCP) specification, making it easy to:

- Build MCP clients that can connect to any MCP server
- Create MCP servers that expose resources, prompts, and tools
- Use standard transports like stdio and Server-Sent Events (SSE)
- Handle all MCP protocol messages and lifecycle events

## Installation

Install the MCP SDK via npm:

```bash
npm install @modelcontextprotocol/sdk
```

## Quickstart

Below is a simple MCP server example that exposes a calculator tool and a dynamic greeting resource:

```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

// Add an addition tool
server.tool("add",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

// Add a dynamic greeting resource
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
```

## What is MCP?

The Model Context Protocol (MCP) allows applications to provide context for Large Language Models (LLMs) in a standardized way, separating the concerns of providing context from the actual LLM interaction. MCP servers can:

- Expose data through Resources (similar to GET endpoints in a REST API)
- Provide functionality through Tools (similar to POST endpoints)
- Define interaction templates through Prompts

## Core Concepts

### Server

The `McpServer` is the core interface to MCP. It manages connection, protocol compliance, and message routing:

```typescript
const server = new McpServer({
  name: "My App",
  version: "1.0.0"
});
```

### Resources

Resources expose data to LLMs. They are analogous to GET endpoints:

```typescript
server.resource(
  "config",
  "config://app",
  async (uri) => ({
    contents: [{ uri: uri.href, text: "App configuration here" }]
  })
);
```

### Tools

Tools let LLMs execute actions, similar to POST endpoints:

```typescript
server.tool(
  "calculate-bmi",
  { weightKg: z.number(), heightM: z.number() },
  async ({ weightKg, heightM }) => ({
    content: [{ type: "text", text: String(weightKg / (heightM * heightM)) }]
  })
);
```

### Prompts

Prompts are reusable templates that facilitate LLM interactions with your server:

```typescript
server.prompt(
  "review-code",
  { code: z.string() },
  ({ code }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: `Please review this code:\n\n${code}` }
    }]
  })
);
```

## Running Your Server

### stdio

For command-line tools and direct integrations:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "example-server",
  version: "1.0.0"
});

// ... set up resources, tools, and prompts ...

const transport = new StdioServerTransport();
await server.connect(transport);
```

### HTTP with SSE

For remote servers, you can create an SSE endpoint. For example:

```typescript
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const server = new McpServer({
  name: "example-server",
  version: "1.0.0"
});

// ... set up resources, tools, and prompts ...

const app = express();

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  // Handle incoming messages
});

app.listen(3001);
```

## Testing and Debugging

Use the MCP Inspector to test and debug your server, ensuring protocol compliance and proper message exchange.

## Examples

### Echo Server

A simple server demonstrating resources, tools, and prompts:

```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "Echo",
  version: "1.0.0"
});

server.resource(
  "echo",
  new ResourceTemplate("echo://{message}", { list: undefined }),
  async (uri, { message }) => ({
    contents: [{ uri: uri.href, text: `Resource echo: ${message}` }]
  })
);

server.tool(
  "echo",
  { message: z.string() },
  async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }]
  })
);

server.prompt(
  "echo",
  { message: z.string() },
  ({ message }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: `Please process this message: ${message}` }
    }]
  })
);
```

### SQLite Explorer

An example with database integration:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import sqlite3 from "sqlite3";
import { promisify } from "util";
import { z } from "zod";

const server = new McpServer({
  name: "SQLite Explorer",
  version: "1.0.0"
});

const getDb = () => {
  const db = new sqlite3.Database("database.db");
  return {
    all: promisify(db.all.bind(db)),
    close: promisify(db.close.bind(db))
  };
};

server.resource(
  "schema",
  "schema://main",
  async (uri) => {
    const db = getDb();
    try {
      const tables = await db.all("SELECT sql FROM sqlite_master WHERE type='table'");
      return {
        contents: [{ uri: uri.href, text: tables.map((t: { sql: string }) => t.sql).join("\n") }]
      };
    } finally {
      await db.close();
    }
  }
);

server.tool(
  "query",
  { sql: z.string() },
  async ({ sql }) => {
    const db = getDb();
    try {
      const results = await db.all(sql);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    } finally {
      await db.close();
    }
  }
);
```

## Advanced Usage

For more control, use the low-level Server class directly:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "example-server", version: "1.0.0" },
  { capabilities: { prompts: {} } }
);

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [{
    name: "example-prompt",
    description: "An example prompt template",
    arguments: [{ name: "arg1", description: "Example argument", required: true }]
  }]
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name !== "example-prompt") {
    throw new Error("Unknown prompt");
  }
  return {
    description: "Example prompt",
    messages: [{ role: "user", content: { type: "text", text: "Example prompt text" } }]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Writing MCP Clients

The SDK provides a high-level client interface:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["server.js"]
});

const client = new Client(
  { name: "example-client", version: "1.0.0" },
  { capabilities: { prompts: {}, resources: {}, tools: {} } }
);

await client.connect(transport);

// List prompts
const prompts = await client.listPrompts();

// Get a prompt
const prompt = await client.getPrompt("example-prompt", { arg1: "value" });

// List resources
const resources = await client.listResources();

// Read a resource
const resource = await client.readResource("file:///example.txt");

// Call a tool
const result = await client.callTool({ name: "example-tool", arguments: { arg1: "value" } });
```

## Documentation and License

The MCP TypeScript SDK is licensed under the MIT License. For further details, refer to the LICENSE file in the repository.

For more information, visit the following links:
- [MCP TypeScript SDK on GitHub](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)

## Server-Sent Events (SSE) Transport

The MCP TypeScript SDK provides a built-in `SSEServerTransport` for handling Server-Sent Events (SSE) connections. This is the recommended approach for implementing real-time communication between the MCP server and clients.

### Basic SSE Setup

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const server = new McpServer({
  name: "example-server",
  version: "1.0.0"
});

// Set up your server resources, tools, and prompts...

// Create SSE endpoint
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

// Handle client messages
app.post("/messages", async (req, res) => {
  await transport.handlePostMessage(req, res);
});
```

### Important Notes

1. **Transport Lifecycle**: The `SSEServerTransport` manages the entire lifecycle of the SSE connection, including:
   - Setting up appropriate headers
   - Handling connection keep-alive
   - Managing message delivery
   - Cleaning up resources on disconnect

2. **Message Handling**: The transport automatically handles:
   - Converting messages to SSE format
   - Maintaining the connection
   - Error handling and recovery

3. **Best Practices**:
   - Always use SSEServerTransport for SSE connections
   - Handle connection errors appropriately
   - Implement proper cleanup on connection close

### Example Implementation

Here's a complete example of setting up an MCP server with SSE transport:

```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

const server = new McpServer({
  name: "SSE Example",
  version: "1.0.0"
});

// Add a resource
server.resource(
  "data",
  new ResourceTemplate("data://{id}", { list: undefined }),
  async (uri, { id }) => ({
    contents: [{
      uri: uri.href,
      text: `Data for ID: ${id}`
    }]
  })
);

// Add a tool
server.tool(
  "process",
  { input: z.string() },
  async ({ input }) => ({
    content: [{ type: "text", text: `Processed: ${input}` }]
  })
);

// Set up SSE endpoint
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

// Handle client messages
app.post("/messages", async (req, res) => {
  await transport.handlePostMessage(req, res);
});
```

### Error Handling

Always implement proper error handling:

```typescript
app.get("/sse", async (req, res) => {
  try {
    const transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
  } catch (error) {
    console.error("SSE connection error:", error);
    res.status(500).json({ error: "Failed to establish SSE connection" });
  }
});
```

## Additional Resources

- [MCP Specification](https://spec.modelcontextprotocol.io)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io) 
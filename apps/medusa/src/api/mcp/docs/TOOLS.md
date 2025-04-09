# Tools and Actions

## Overview

Tools are a powerful primitive in the Model Context Protocol (MCP) that enable servers to expose executable functionality to clients. Through tools, LLMs can interact with external systems, perform computations, and take real-world actions. Tools are designed to be model-controlled, meaning that they are exposed from servers to clients for automatic invocation by AI models (with a human in the loop to grant approval when needed).

Tools in MCP allow servers to:

- Discover available actions via the `tools/list` endpoint.
- Invoke functionality through the `tools/call` endpoint, where servers perform the requested operation and return results.
- Expose dynamic operations ranging from simple calculations to complex API interactions.

Unlike resources, which represent static data, tools represent operations that can modify state or interact with external systems. They are identified by unique names and may include detailed descriptions and JSON Schema definitions for parameters.

## Tool Definition Structure

Each tool is defined with the following structure:

```json
{
  "name": "string",          // Unique identifier for the tool
  "description": "string",   // Human-readable description
  "inputSchema": {             // JSON Schema for the tool's parameters
    "type": "object",
    "properties": { /* Tool-specific parameters */ }
  }
}
```

## Implementing Tools

Below is an example of implementing a basic tool in an MCP server using TypeScript:

```typescript
const server = new Server({
  name: "example-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: "calculate_sum",
      description: "Add two numbers together",
      inputSchema: {
        type: "object",
        properties: {
          a: { type: "number" },
          b: { type: "number" }
        },
        required: ["a", "b"]
      }
    }]
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "calculate_sum") {
    const { a, b } = request.params.arguments;
    return {
      content: [
        {
          type: "text",
          text: String(a + b)
        }
      ]
    };
  }
  throw new Error("Tool not found");
});
```

## Example Tool Patterns

Below are some examples of common tool patterns:

### 1. System Operations

Tools that interact with the local system, e.g., executing shell commands:

```json
{
  "name": "execute_command",
  "description": "Run a shell command",
  "inputSchema": {
    "type": "object",
    "properties": {
      "command": { "type": "string" },
      "args": { "type": "array", "items": { "type": "string" } }
    }
  }
}
```

### 2. API Integrations

Tools that wrap external APIs, e.g., creating a GitHub issue:

```json
{
  "name": "github_create_issue",
  "description": "Create a GitHub issue",
  "inputSchema": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "body": { "type": "string" },
      "labels": { "type": "array", "items": { "type": "string" } }
    }
  }
}
```

### 3. Data Processing

Tools that transform or analyze data:

```json
{
  "name": "analyze_csv",
  "description": "Analyze a CSV file",
  "inputSchema": {
    "type": "object",
    "properties": {
      "filepath": { "type": "string" },
      "operations": {
        "type": "array",
        "items": { "enum": ["sum", "average", "count"] }
      }
    }
  }
}
```

## Best Practices

When implementing tools:

- **Naming and Documentation:** Provide clear, descriptive names and detailed descriptions with examples to guide usage.
- **JSON Schema:** Define comprehensive JSON Schema definitions for tool parameters to ensure input validation.
- **Error Handling:** Implement robust error handling, returning errors in the result object rather than as protocol-level errors.
- **Atomic Operations:** Keep tool operations focused and atomic, suitable for the intended action.
- **Progress Reporting:** For long-running operations, include progress tokens to report progress incrementally.
- **Timeouts and Rate Limiting:** Implement appropriate timeouts and rate limiting for resource-intensive operations.

## Security Considerations

When exposing tools:

- **Input Validation:** Validate and sanitize all parameters against the JSON Schema; prevent command injection and other malicious inputs.
- **Access Control:** Implement authentication and authorization checks where necessary, and audit tool usage.
- **Error Reporting:** Do not expose internal errors to clients; log security-relevant errors and handle timeouts.

## Tool Discovery and Updates

- Clients can list available tools through the `tools/list` endpoint at any time.
- Servers can notify clients of changes in available tools using the `notifications/tools/list_changed` notification.
- Tools can be dynamically added, updated, or removed during runtime, but such changes should be managed carefully.

## Testing Tools

A comprehensive testing strategy for MCP tools should cover:

- **Functional Testing:** Verify tools execute correctly with valid inputs and handle invalid inputs appropriately.
- **Integration Testing:** Test tool interactions with external systems using both real and mocked dependencies.
- **Security Testing:** Validate input sanitization, authentication, authorization, and rate limiting.
- **Performance Testing:** Monitor behavior under load, timeout handling, and proper cleanup of resources.
- **Error Handling:** Ensure tools properly return error information within the result object, allowing the LLM to detect and handle errors. 
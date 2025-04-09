# MCP Client Core Documentation

## Overview

The `Client` class is a generic implementation of an MCP (Model Context Protocol) client built on top of a pluggable transport. It extends the base `Protocol` class and facilitates communication with an MCP server through a structured request/response mechanism. The design leverages TypeScript generics, allowing for custom request, notification, and result types to be used for enhanced type safety and extensibility.

## Features

- **Extensible Design:** Uses TypeScript generics to support custom schemas for requests, notifications, and results.
- **Pluggable Transport:** Works with any transport implementation that adheres to the expected interface, enabling flexibility in communication channels.
- **Automatic Initialization:** The client automatically begins an initialization flow when `connect()` is called, negotiating protocol versions and capabilities with the server.
- **Capability Negotiation:** Both client and server capabilities are managed and asserted to ensure that only supported operations are executed. Methods like `registerCapabilities`, `assertCapability`, and `assertCapabilityForMethod` enforce these checks.
- **Utility Methods:** Provides numerous helper methods (e.g., `ping`, `complete`, `setLoggingLevel`, `getPrompt`, `listResources`, etc.) that wrap the underlying request mechanism to standardize interactions with the server.
- **Error Handling:** Gracefully handles errors such as unsupported protocol versions, missing capabilities, and request timeouts or cancellations.

## Implementation Details

### Constructor & Initialization

- **Constructor:**
  - Signature: `new Client(clientInfo: Implementation, options?: ClientOptions)`
  - Initializes the client with information (name and version) and optional client capabilities. It also inherits configuration by calling the base `Protocol` constructor.

- **Initialization Flow (`connect`):**
  1. Connects to the provided transport using the base class's implementation.
  2. Sends an `initialize` request with the following parameters:
     - `protocolVersion`: Must match the latest supported version (`LATEST_PROTOCOL_VERSION`).
     - `capabilities`: The client’s declared capabilities.
     - `clientInfo`: Information about the client (e.g., name and version).
  3. Validates the response against `InitializeResultSchema` and checks that the server's protocol version is supported. If not, it throws an error and disconnects.
  4. Stores the retrieved server capabilities, server version, and any initialization instructions.
  5. Sends a notification (`notifications/initialized`) to finalize the initialization flow.

### Capability Management

- **registerCapabilities:**
  - Merges additional client capabilities before a transport connection is established. Attempting to register capabilities after connecting will result in an error.

- **assertCapability & assertCapabilityForMethod:**
  - These methods ensure that specific features required by a method or notification are available on the server. For instance, a method like `listResources` checks if the server supports the `resources` capability.

- **assertNotificationCapability:**
  - Validates that the client is capable of sending a particular notification, such as roots list change notifications.

### Utility Methods

The client provides several helper methods that encapsulate underlying request calls:

- **ping:** Sends a simple ping request to the server.
- **complete:** Submits a completion request using provided parameters.
- **setLoggingLevel:** Adjusts the logging level on the server.
- **getPrompt & listPrompts:** Requests prompt information from the server.
- **listResources & listResourceTemplates & readResource:** Manage resource retrieval operations.
- **subscribeResource & unsubscribeResource:** Handle resource subscription management.
- **callTool & listTools:** Facilitate interactions with tools provided by the server.
- **sendRootsListChanged:** Sends a notification that the roots list has changed.

All these methods fundamentally wrap the base `request` or `notification` function providing standardized schema validation and error handling.

## Usage Examples

### Basic Implementation Example

```typescript
import { Client } from 'path/to/client';
import { Transport } from 'path/to/transport';

const clientInfo = { name: 'MyClient', version: '1.0.0' };

const client = new Client(clientInfo, {
  capabilities: {
    sampling: {},
    // Add other capabilities as needed
  },
});

const transport: Transport = /* initialize your transport here */;

async function initializeClient() {
  try {
    await client.connect(transport);
    console.log('Client connected successfully');
    console.log('Server Capabilities:', client.getServerCapabilities());
    console.log('Server Version:', client.getServerVersion());
  } catch (error) {
    console.error('Error during client initialization:', error);
  }
}

initializeClient();
```

### Extending Client with Custom Types

The Client class is designed to work with custom schemas using libraries such as Zod. Here's an example:

```typescript
import { z } from 'zod';
import { Client } from 'path/to/client';
import { RequestSchema, NotificationSchema, ResultSchema } from 'path/to/types';

const CustomRequestSchema = RequestSchema.extend({
  method: z.literal('custom/action'),
  params: z.object({
    data: z.string(),
  }),
});

const CustomNotificationSchema = NotificationSchema.extend({
  method: z.literal('custom/notify'),
  params: z.object({
    message: z.string(),
  }),
});

const CustomResultSchema = ResultSchema.extend({
  success: z.boolean(),
});

// Define TypeScript types based on the Zod schemas
//
type CustomRequest = z.infer<typeof CustomRequestSchema>;
type CustomNotification = z.infer<typeof CustomNotificationSchema>;
type CustomResult = z.infer<typeof CustomResultSchema>;

// Create a typed Client
const customClient = new Client<CustomRequest, CustomNotification, CustomResult>(
  { name: 'CustomClient', version: '1.0.0' },
  { capabilities: { sampling: {} } }
);
```

## API Reference

### Constructor

- `new Client(clientInfo: Implementation, options?: ClientOptions)`
  - Initializes a new Client instance with the provided client information and optional capabilities.

### Public Methods

- **registerCapabilities(capabilities: ClientCapabilities): void**
  - Merges new client capabilities. Must be called before connecting to a transport.

- **connect(transport: Transport): Promise<void>**
  - Connects the client to the provided transport, initiates the initialization flow, validates protocol versions, and stores server capabilities and version information.

- **getServerCapabilities(): ServerCapabilities | undefined**
  - Retrieves the server's capabilities after successful initialization.

- **getServerVersion(): Implementation | undefined**
  - Retrieves the server's version and identification information.

- **getInstructions(): string | undefined**
  - Returns any additional instructions provided by the server during initialization.

- **assertCapability(capability: keyof ServerCapabilities, method: string): void**
  - Checks that a specific server capability is available; throws an error if not.

- **assertCapabilityForMethod(method: RequestT["method"]): void**
  - Verifies that the server supports the required capabilities for the given method.

- **assertNotificationCapability(method: NotificationT["method"]): void**
  - Ensures that the client’s notification capability for the specified method is declared.

- **Utility Methods:**
  - `ping(options?: RequestOptions)
  - complete(params: CompleteRequest["params"], options?: RequestOptions)
  - setLoggingLevel(level: LoggingLevel, options?: RequestOptions)
  - getPrompt(params: GetPromptRequest["params"], options?: RequestOptions)
  - listPrompts(params?: ListPromptsRequest["params"], options?: RequestOptions)
  - listResources(params?: ListResourcesRequest["params"], options?: RequestOptions)
  - listResourceTemplates(params?: ListResourceTemplatesRequest["params"], options?: RequestOptions)
  - readResource(params: ReadResourceRequest["params"], options?: RequestOptions)
  - subscribeResource(params: SubscribeRequest["params"], options?: RequestOptions)
  - unsubscribeResource(params: UnsubscribeRequest["params"], options?: RequestOptions)
  - callTool(params: CallToolRequest["params"], resultSchema?: typeof CallToolResultSchema | typeof CompatibilityCallToolResultSchema, options?: RequestOptions)
  - listTools(params?: ListToolsRequest["params"], options?: RequestOptions)
  - sendRootsListChanged()

Each of these methods acts as a thin wrapper around the base request or notification mechanism, ensuring proper schema validation and capability checks.

## Error Handling & Edge Cases

- **Protocol Version Mismatch:**
  - If the server responds with an unsupported protocol version, the `connect` method throws an error and disconnects the client.

- **Capability Assertions:**
  - Before executing specific actions, the client asserts that both it and the server support the required capabilities. Missing capabilities trigger descriptive errors.

- **Request Cancellation and Timeouts:**
  - The client supports cancellation via AbortController and respects request timeouts, as demonstrated in the tests.

## Testing and Validation

The accompanying tests verify:

- Initialization flows with both matching and older protocol versions.
- The enforcement of required server and client capabilities.
- Proper error throwing for unsupported protocol versions.
- The behavior of cancellations and timeouts for requests.
- Custom schema integrations with typed clients.

## Best Practices

- **Register Capabilities Early:** Call `registerCapabilities` before establishing a connection to ensure all desired features are advertised.
- **Robust Error Handling:** Wrap your client operations in try/catch blocks to gracefully handle connection failures or capability mismatches.
- **Custom Typing:** Leverage TypeScript generics and schema validation (e.g., using Zod) to enforce strict contracts between client and server communications.
- **Utilize Utility Methods:** Use the provided helper methods for common tasks to reduce code duplication and maintain consistency.

## Conclusion

The `Client` class provides a robust and extensible foundation for implementing MCP-based client-server interactions. Its design emphasizes capability negotiation, strict protocol compliance, and ease of integration with custom types, making it a powerful tool for developing advanced communication systems.

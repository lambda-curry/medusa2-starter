# Sampling and LLM Completions

## Overview

Sampling is a powerful feature of the Model Context Protocol (MCP) that allows servers to request LLM completions through the client. This enables sophisticated agentic behaviors while maintaining security and privacy. Note that this feature is not yet supported in the Claude Desktop client.

## How Sampling Works

The sampling flow follows these steps:

1. **Request Creation:** The server sends a `sampling/createMessage` request to the client.
2. **Prompt Review:** The client reviews the request and can modify it if needed.
3. **LLM Sampling:** The client samples a completion from an LLM.
4. **Completion Review:** The client reviews the completion.
5. **Response:** The client returns the result to the server.

This human-in-the-loop design ensures that users maintain control over what the LLM sees and generates.

## Message Format

Sampling requests use a standardized message format:

```json
{
  "messages": [
    {
      "role": "user" | "assistant",
      "content": {
        "type": "text" | "image",
        
        // For text:
        "text": "string",
        
        // For images:
        "data": "string",             // base64 encoded
        "mimeType": "string"
      }
    }
  ],
  "modelPreferences": {
    "hints": [{
      "name": "string"           // Suggested model name/family
    }],
    "costPriority": number,         // 0-1, importance of minimizing cost
    "speedPriority": number,        // 0-1, importance of low latency
    "intelligencePriority": number  // 0-1, importance of advanced model capabilities
  },
  "systemPrompt": "string",
  "includeContext": "none" | "thisServer" | "allServers",
  "temperature": number,
  "maxTokens": number,
  "stopSequences": ["string"],
  "metadata": { /* arbitrary key-value pairs */ }
}
```

## Request Parameters

### Messages

- **messages:** An array containing the conversation history to send to the LLM. Each message has:
  - **role:** Either "user" or "assistant".
  - **content:** The message content, which may be text (with a "text" field) or image (with "data" and "mimeType" fields).

### Model Preferences

- **modelPreferences:** Allows servers to specify model selection preferences:
  - **hints:** An array of suggested model names.
  - **costPriority, speedPriority, intelligencePriority:** Priority values (normalized between 0 and 1) for cost, latency, and capability, respectively.

### System Prompt

- **systemPrompt:** An optional field for requesting a specific system prompt; the client may modify or ignore this.

### Context Inclusion

- **includeContext:** Specifies what MCP context to include in the request:
  - "none": No additional context.
  - "thisServer": Context from the requesting server.
  - "allServers": Context from all connected MCP servers.

### Sampling Parameters

- **temperature:** Controls randomness (0.0 to 1.0).
- **maxTokens:** Maximum tokens to generate.
- **stopSequences:** Array of strings that signal generation to stop.
- **metadata:** Additional provider-specific parameters.

## Response Format

The client returns a completion result with the following structure:

```json
{
  "model": "string",  // Name of the model used
  "stopReason": "endTurn" | "stopSequence" | "maxTokens" | "string",
  "role": "user" | "assistant",
  "content": {
    "type": "text" | "image",
    "text": "string",
    "data": "string",
    "mimeType": "string"
  }
}
```

## Example Request

Here's an example of requesting sampling from a client:

```json
{
  "method": "sampling/createMessage",
  "params": {
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "text": "What files are in the current directory?"
        }
      }
    ],
    "systemPrompt": "You are a helpful file system assistant.",
    "includeContext": "thisServer",
    "maxTokens": 100
  }
}
```

## Best Practices

- **Prompt Clarity:** Provide clear, well-structured prompts.
- **Content Handling:** Appropriately handle both text and image content.
- **Token Limits:** Set reasonable token limits to manage output.
- **Context Inclusion:** Include relevant context using the `includeContext` parameter.
- **Response Validation:** Validate responses before using them.
- **Error Handling:** Handle errors gracefully, including timeouts and sampling errors.
- **Rate Limiting:** Implement rate limits for sampling requests.
- **Cost Monitoring:** Monitor sampling costs and manage model usage.

## Human in the Loop Controls

Sampling is designed with human oversight:

- **Prompt Review:** Clients should display the proposed prompt to users, who can modify or reject it.
- **Completion Review:** Clients should show the generated completion so users can approve or modify it.
- **System Prompts and Context:** System prompts can be filtered or modified, and clients control context inclusion.

## Common Patterns

### Agentic Workflows

- Reading and analyzing resources
- Making decisions based on context
- Generating structured data
- Handling multi-step tasks
- Providing interactive assistance

### Context Management

- Request minimal necessary context
- Structure context clearly
- Handle context size limits and update context as needed
- Clean up stale context

## Error Handling

- Catch sampling failures and timeouts
- Manage rate limits and provide fallback behaviors
- Validate responses and log errors appropriately

## Limitations

- Sampling depends on client capabilities and may not be supported by all clients (e.g., Claude Desktop).
- Users maintain control over sampling behavior.
- Context size limits and rate limits may apply.
- Model availability, response times, and costs vary. 
# Prompts and Workflows

## Overview

Prompts enable servers to define reusable prompt templates and workflows that clients can easily surface to users and LLMs. They provide a powerful way to standardize and share common LLM interactions.

Prompts are designed to be user-controlled, meaning they are exposed from servers to clients with the intention of the user explicitly selecting them for use.

Prompts in MCP can:

- Accept dynamic arguments
- Include context from resources
- Chain multiple interactions
- Guide specific workflows
- Surface as UI elements (e.g., slash commands, quick actions, context menu items)

## Prompt Structure

Each prompt is defined with the following structure:

```json
{
  "name": "string",              // Unique identifier for the prompt
  "description": "string",       // Human-readable description
  "arguments": [                   // Optional list of arguments
    {
      "name": "string",          // Argument identifier
      "description": "string",   // Argument description
      "required": boolean          // Whether argument is required
    }
  ]
}
```

## Discovering Prompts

Clients can discover available prompts via the `prompts/list` endpoint.

**Request Example:**

```json
{
  "method": "prompts/list"
}
```

**Response Example:**

```json
{
  "prompts": [
    {
      "name": "analyze-code",
      "description": "Analyze code for potential improvements",
      "arguments": [
        {
          "name": "language",
          "description": "Programming language",
          "required": true
        }
      ]
    }
  ]
}
```

## Using Prompts

To use a prompt, clients make a `prompts/get` request with the prompt name and arguments.

**Request Example:**

```json
{
  "method": "prompts/get",
  "params": {
    "name": "analyze-code",
    "arguments": {
      "language": "python"
    }
  }
}
```

**Response Example:**

```json
{
  "description": "Analyze Python code for potential improvements",
  "messages": [
    {
      "role": "user",
      "content": {
        "type": "text",
        "text": "Please analyze the following Python code for potential improvements:\n\n```python\ndef calculate_sum(numbers):\n    total = 0\n    for num in numbers:\n        total += num\n    return total\n\nresult = calculate_sum([1, 2, 3, 4, 5])\nprint(result)\n```"
      }
    }
  ]
}
```

## Dynamic Prompts

Prompts can be dynamic and incorporate embedded resource context. For example, a prompt for project analysis might look like:

```json
{
  "name": "analyze-project",
  "description": "Analyze project logs and code",
  "arguments": [
    {
      "name": "timeframe",
      "description": "Time period to analyze logs",
      "required": true
    },
    {
      "name": "fileUri",
      "description": "URI of code file to review",
      "required": true
    }
  ]
}
```

When processing a `prompts/get` request, the server might respond with messages that include both text and resource content:

```json
{
  "messages": [
    {
      "role": "user",
      "content": {
        "type": "text",
        "text": "Analyze these system logs and the code file for any issues:"
      }
    },
    {
      "role": "user",
      "content": {
        "type": "resource",
        "resource": {
          "uri": "logs://recent?timeframe=1h",
          "text": "[2024-03-14 15:32:11] ERROR: Connection timeout...",
          "mimeType": "text/plain"
        }
      }
    },
    {
      "role": "user",
      "content": {
        "type": "resource",
        "resource": {
          "uri": "file:///path/to/code.py",
          "text": "def connect_to_service(timeout=30):\n    //...code...",
          "mimeType": "text/x-python"
        }
      }
    }
  ]
}
```

## Multi-step Workflows

Prompts can also be used to create multi-step workflows. For instance, a debugging workflow might be defined as:

```javascript
const debugWorkflow = {
  name: "debug-error",
  async getMessages(error) {
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `Here's an error I'm seeing: ${error}`
        }
      },
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'll help analyze this error. What have you tried so far?"
        }
      },
      {
        role: "user",
        content: {
          type: "text",
          text: "I've tried restarting the service, but the error persists."
        }
      }
    ];
  }
};
```

## Example Implementation

Below is an example of implementing prompts in an MCP server using TypeScript:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types";

const PROMPTS = {
  "git-commit": {
    name: "git-commit",
    description: "Generate a Git commit message",
    arguments: [
      {
        name: "changes",
        description: "Git diff or description of changes",
        required: true
      }
    ]
  },
  "explain-code": {
    name: "explain-code",
    description: "Explain how code works",
    arguments: [
      {
        name: "code",
        description: "Code to explain",
        required: true
      },
      {
        name: "language",
        description: "Programming language",
        required: false
      }
    ]
  }
};

const server = new Server({
  name: "example-prompts-server",
  version: "1.0.0"
}, {
  capabilities: {
    prompts: {}
  }
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: Object.values(PROMPTS)
  };
});

// Get a specific prompt
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const prompt = PROMPTS[request.params.name];
  if (!prompt) {
    throw new Error(`Prompt not found: ${request.params.name}`);
  }

  if (request.params.name === "git-commit") {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a concise but descriptive commit message for these changes:\n\n${request.params.arguments?.changes}`
          }
        }
      ]
    };
  }

  if (request.params.name === "explain-code") {
    const language = request.params.arguments?.language || "Unknown";
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Explain how this ${language} code works:\n\n${request.params.arguments?.code}`
          }
        }
      ]
    };
  }

  throw new Error("Prompt implementation not found");
});
```

## Best Practices

When implementing prompts:

- Use clear, descriptive prompt names.
- Provide detailed descriptions for prompts and their arguments.
- Validate all required arguments and handle missing arguments gracefully.
- Consider versioning for prompt templates.
- Cache dynamic content when appropriate.
- Implement robust error handling and document expected argument formats.
- Consider prompt composability and test prompts with various inputs.

## UI Integration

Prompts can be surfaced in client UIs as:

- Slash commands
- Quick actions
- Context menu items
- Command palette entries
- Guided workflows
- Interactive forms

## Updates and Changes

Servers can notify clients about prompt changes:

- Server capability: `prompts.listChanged`
- Notification: `notifications/prompts/list_changed`
- Clients should re-fetch the prompt list upon receiving such notifications

## Security Considerations

When implementing prompts:

- Validate all inputs and sanitize user input.
- Consider rate limiting and implement access controls.
- Audit prompt usage and handle sensitive data appropriately.
- Validate generated content and implement timeouts.
- Consider risks of prompt injection and document security requirements. 
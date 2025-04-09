# Roots in MCP

## Overview

Roots are a concept in the Model Context Protocol (MCP) that define the boundaries where servers can operate. They provide a way for clients to inform servers about relevant resources and their locations.

## What are Roots?

A root is a URI that a client suggests a server should focus on. When a client connects to a server, it declares which roots the server should work with. While primarily used for filesystem paths, roots can be any valid URI including HTTP URLs.

For example, roots could be:

- `file:///home/user/projects/myapp`
- `https://api.example.com/v1`

## Why Use Roots?

Roots serve several important purposes:

- **Guidance:** They inform servers about relevant resources and locations.
- **Clarity:** Roots make it clear which resources are part of your workspace.
- **Organization:** Multiple roots let you work with different resources simultaneously.

## How Roots Work

When a client supports roots, it:

- Declares the roots capability during connection
- Provides a list of suggested roots to the server
- Notifies the server when roots change (if supported)

While roots are informational and not strictly enforcing, servers should:

- Respect the provided roots
- Use root URIs to locate and access resources
- Prioritize operations within root boundaries

## Common Use Cases

Roots are commonly used to define:

- Project directories
- Repository locations
- API endpoints
- Configuration locations
- Resource boundaries

## Best Practices

When working with roots:

- Only suggest necessary resources
- Use clear, descriptive names for roots
- Monitor root accessibility
- Handle root changes gracefully

## Example

Here's how a typical MCP client might expose roots:

```json
{
  "roots": [
    {
      "uri": "file:///home/user/projects/frontend",
      "name": "Frontend Repository"
    },
    {
      "uri": "https://api.example.com/v1",
      "name": "API Endpoint"
    }
  ]
}
```

This configuration suggests the server focus on both a local repository and an API endpoint while keeping them logically separated. 
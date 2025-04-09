# AI Instructions for Utilizing the Product Requirements Document

## Overview
This document provides guidance for the AI (and developers) on how to use the Product Requirements Document (PRD) included in this project. The PRD is a living document that outlines requirements, designs, implementation steps, checklists, and progress notes for the MCP Medusa Integration with SSE.

## Project Structure
```
apps/medusa/src/api/mcp/
├── ai/                     # AI and project management documentation
│   ├── AI_INSTRUCTIONS.md  # This file
│   ├── MCP_REQUIREMENTS.md # Product requirements
│   └── TESTING_STRATEGY.md # Testing strategy and guidelines
├── docs/                   # Technical documentation
│   ├── CORE_ARCHITECTURE.md
│   ├── MCP_CLIENT.md
│   ├── MCP_TYPESCRIPT_SDK_DOC.md
│   ├── PROMPTS.md
│   ├── RESOURCES.md
│   ├── ROOTS.md
│   ├── SAMPLING.md
│   ├── TOOLS.md
│   └── TRANSPORTS.md
├── index.ts               # Module definition
├── service.ts            # MCP service implementation
├── middlewares.ts        # Express middleware
├── messages/            # JSON-RPC message handling
├── sse/                # SSE transport implementation
└── loaders/            # Server initialization
```

## Instructions for the AI
1. **Review the PRD**: Start by reading the `MCP_REQUIREMENTS.md` file in the `ai/` directory to fully understand the project requirements.
2. **Update Progress**: After completing each milestone, update the "Progress Notes" section in the PRD with details about changes, challenges, and next steps.
3. **Maintain Checklists**: Mark off completed items and create new tasks as necessary, ensuring that all work is tracked accurately.
4. **Iterative Updates**: Regularly update the document to reflect the true status of the project, ensuring transparency and effective communication.
5. **Collaboration**: Use this document as the central reference point for project management and share updates with relevant team members.

## Modifications and Versioning
- Edit this document using version control to document changes along with meaningful commit messages.
- Ensure that any updates to the workflow are reflected in both this and the PRD documents.

## Goals
- Provide clear and actionable instructions for managing and updating the PRD.
- Keep the PRD synchronized with the actual project progress and any evolving requirements.

## Documentation Structure

### Project Management (in `/ai`)
- **AI_INSTRUCTIONS.md**: This file - guidance for AI and developers
- **MCP_REQUIREMENTS.md**: Detailed product requirements and progress logs
- **TESTING_STRATEGY.md**: Comprehensive testing strategy and guidelines

### Technical Documentation (in `/docs`)
- **CORE_ARCHITECTURE.md**: Overview of MCP's core architecture and key concepts
- **MCP_CLIENT.md**: Client implementation and usage documentation
- **MCP_TYPESCRIPT_SDK_DOC.md**: Detailed documentation for the MCP TypeScript SDK
- **TRANSPORTS.md**: Documentation for MCP transports and communication
- **ROOTS.md**: Concepts and best practices for using roots in MCP
- **SAMPLING.md**: Guidelines for sampling strategies and LLM completions
- **PROMPTS.md**: Documentation for prompt templates and workflows
- **TOOLS.md**: Descriptions of available tools and their usage
- **RESOURCES.md**: Details on resource integration and data exposure

## Additional References
For implementation details of the MCP TypeScript SDK, refer to `docs/MCP_TYPESCRIPT_SDK_DOC.md`.
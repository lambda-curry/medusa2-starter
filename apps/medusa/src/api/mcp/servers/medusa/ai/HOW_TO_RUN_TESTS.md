# How to Run MCP Tests

## Prerequisites

- Node.js >= 20
- Docker (for database)
- Yarn package manager

## Setup

1. Initialize the test database and seed data:
```bash
yarn dev
```

This command will:
- Reset the database
- Create a new database named 'medusa2'
- Run migrations
- Seed initial data
- Create test users

## Running Tests

### MCP Tests

**Note:** All test commands should be run from the `apps/medusa` directory to properly capture test output.

For running MCP (Model Context Protocol) tests:

```bash
# Run tests once
yarn test:mcp

# Run tests in watch mode (during development)
yarn test:mcp:watch

# Run tests with coverage report
yarn test:mcp:coverage
```

### Test Structure

Tests are located in `src/api/mcp/tests/__tests__/` and include:
- `client-setup.test.ts` - Tests for MCP client setup and connection
- `products.test.ts` - Tests for product-related MCP tools
- more tests will be added as we add more tools

### Test Environment

Tests run with the following configuration:
- Server URL: `http://localhost:9000/mcp/sse`
- Test client name: 'MCP-Test-Client'
- Content type: application/json

## Troubleshooting

If tests fail to connect, ensure:
1. The Medusa server is running (`yarn dev`)
2. The database is properly initialized (`yarn medusa:init`)
3. The test server URL is accessible (`http://localhost:9000/mcp/sse`)

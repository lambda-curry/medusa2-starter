# MCP Testing Strategy

## Overview

This document outlines the testing strategy for the Model Context Protocol (MCP) integration with Medusa. We use Jest with Medusa testing utilities to provide comprehensive test coverage while maintaining efficient feedback loops during development.

## Test Environment

### Prerequisites
- Medusa test server running on `localhost:9000`
- MCP endpoints available at:
  - SSE: `/mcp/sse`
  - Messages: `/mcp/messages`
- Dynamic test database management via Medusa test utilities

### Setup Instructions

1. Install test dependencies:
   ```bash
   npm install -D jest @types/jest @swc/jest @medusajs/test-utils
   ```

2. Configure Jest:
   ```bash
   # jest.config.js
   module.exports = {
     transform: {
       "^.+\\.(t|j)sx?$": "@swc/jest"
     },
     testEnvironment: "node",
     testMatch: ["**/__tests__/**/*.[jt]s?(x)"],
     setupFilesAfterEnv: ["./integration-tests/setup.js"],
     collectCoverage: true,
     coverageDirectory: "coverage",
     coverageReporters: ["text", "html"],
     coverageThreshold: {
       global: {
         statements: 80,
         branches: 80,
         functions: 80,
         lines: 80
       }
     }
   }
   ```

## Test Structure

### Directory Layout
```
src/api/mcp/__tests__/
├── setup.ts                # Shared test utilities
├── types.ts               # Test-specific type definitions
├── unit/                 # Unit test suites
│   ├── client.test.ts    # Client unit tests
│   └── products.test.ts  # Product unit tests
└── integration/          # Integration test suites
    ├── setup.js          # Integration setup file
    ├── client.test.ts    # Client integration tests
    └── products.test.ts  # Product integration tests
```

### Test Categories

#### 1. Integration Tests
- Full stack integration tests with live Medusa instance
- Database management via `medusaIntegrationTestRunner`
- API route validation
- Workflow testing
- Authentication and authorization
- Connection establishment testing
- Protocol version negotiation
- End-to-end functionality verification

#### 2. Unit Tests
- Module-level testing
- Business logic validation
- Mocked dependencies
- Type safety verification
- Quick feedback loop tests
- Isolated component testing

#### 3. Performance Tests
- Response time measurements
- Connection stability
- Resource usage monitoring
- Load testing scenarios
- Benchmarking critical paths

## Best Practices

### 1. Test Independence
- Use appropriate lifecycle hooks (`beforeAll`, `afterAll`)
- Leverage Medusa's dynamic database management
- Clean state between test runs
- Isolate test environments
- Use Jest's snapshot testing when appropriate

### 2. Error Handling
- Detailed error assertions
- Proper cleanup in teardown
- Test both success and failure scenarios
- Type-safe error handling
- Use Jest's error matchers effectively

### 3. Authentication & Authorization
- Simulate admin and store tokens
- Test header requirements
- Validate permission levels
- Check authentication workflows
- Mock authentication services when needed

### 4. Type Safety
- TypeScript interfaces for test data
- Response type validation
- Strong typing for API calls
- Type assertions in tests
- Leverage Jest's TypeScript support

## Running Tests

```bash
# Run all tests
npm run test:mcp

# Run integration tests only
npm run test:mcp:integration

# Run unit tests only
npm run test:mcp:unit

# Watch mode for development
npm run test:mcp:watch

# Run with coverage
npm run test:mcp:coverage
```

## Test Coverage

Coverage configuration includes:
- Statement, branch, and function coverage
- HTML report generation
- Minimum coverage thresholds (80% across all metrics)
- Detailed coverage reporting per directory
- Coverage exclusions for test files

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: MCP Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:mcp
      - name: Upload coverage
        uses: actions/upload-artifact@v2
        with:
          name: coverage
          path: coverage/
```

## Maintenance

### Regular Updates
- Keep Jest and Medusa test utils current
- Review and update test cases
- Monitor execution times
- Update documentation
- Regular dependency audits

### Quality Checks
- Code review process
- Type safety maintenance
- Testing patterns review
- Documentation updates
- Performance benchmarking

## Future Enhancements

### 1. Extended Coverage
- Additional tool testing
- Edge case scenarios
- Load testing
- Stress testing
- Integration with Medusa events

### 2. Monitoring
- Performance tracking
- Error rate monitoring
- Resource usage tracking
- Test execution metrics
- Coverage trend analysis

### 3. Developer Experience
- Improved debugging tools
- Faster feedback loops
- Better error reporting
- Enhanced documentation
- Custom Jest matchers for MCP 
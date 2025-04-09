# Testing Best Practices for Medusa MCP Tools

This document outlines the testing approach and best practices for Medusa MCP tools.

## Type Safety

### 1. Using SDK Types
- Import core types from the MCP SDK:
  ```typescript
  import { 
    Client,
    Request, 
    Result, 
    Notification, 
    ServerCapabilities 
  } from '@modelcontextprotocol/sdk/types';
  ```

### 2. Client Types
- Use client-specific types from the SDK:
  ```typescript
  import { Client } from '@modelcontextprotocol/sdk/client';
  import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse';
  ```

### 3. Test Context Types
- Define strongly-typed test context interfaces:
  ```typescript
  interface TestContext {
    client: Client<Request, Notification, Result>;
    getServerCapabilities: () => ServerCapabilities | undefined;
    getServerVersion: () => { name: string; version: string } | undefined;
  }
  ```

### 4. Schema and Validation Types
- Use Zod for runtime validation with proper typing:
  ```typescript
  import { z } from 'zod';
  
  // Define schemas with proper typing
  const ProductSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    handle: z.string(),
    status: z.string(),
  });

  // Infer types from schemas
  type Product = z.infer<typeof ProductSchema>;
  ```

### 5. Using Medusa Types
- Import types from `@medusajs/types` whenever possible:
  ```typescript
  import type {
    ProductDTO,
    ProductVariantDTO,
    MoneyAmountDTO,
    ProductCategoryDTO,
  } from '@medusajs/types';
  ```

### 6. Workflow Types
- Use workflow input/output types from `@medusajs/core-flows`:
  ```typescript
  import type {
    CreateProductWorkflowInputDTO,
    CreateProductCategoriesWorkflowInputDTO,
  } from '@medusajs/core-flows';
  ```

### 7. Query Types
- For fetching data, use the remote query pattern with proper typing:
  ```typescript
  import { remoteQueryObjectFromString } from '@medusajs/framework/utils';
  import type { RemoteQueryObjectConfig } from '@medusajs/framework/types';
  import type { RemoteQueryFn } from '../types';

  // Define query object with proper field typing
  const queryObject = remoteQueryObjectFromString({
    entryPoint: 'product',
    variables: {
      id: product_id,
      filters: query ? { q: query } : undefined,
      take: limit,
      skip: offset,
    },
    fields: [
      'variants.id',
      'variants.title',
      'variants.sku',
      'variants.prices.amount',
    ] as RemoteQueryObjectConfig<'product'>['fields'],
  });

  // Execute query with type safety
  const remoteQuery = req.scope.resolve('remoteQuery') as RemoteQueryFn;
  const { rows } = await remoteQuery<{ variants: ProductVariantDTO[] }>(queryObject);
  ```

### 8. Type Extensions
- Extend Medusa types when creating test interfaces:
  ```typescript
  interface TestCategory extends ProductCategoryDTO {
    metadata?: Record<string, unknown>;
  }
  ```

## Test Structure

### 1. Test Location
- All tests should be in `src/api/mcp/tests/__tests__/`
- Group tests by domain (e.g., `products.test.ts`, `categories.test.ts`)
- Shared test utilities in `src/api/mcp/tests/setup.ts`
- Type definitions in `src/api/mcp/tests/types.ts`

### 2. Test Categories

#### Unit Tests
- Test individual tool components with proper typing:
  ```typescript
  import type { ProductCategoryDTO } from '@medusajs/types';
  import { transformCategory } from '../helpers';

  describe('transformCategory', () => {
    it('should transform category data correctly', () => {
      const input: Partial<ProductCategoryDTO> = {
        name: 'Test Category',
        handle: 'test-category',
      };
      const result = transformCategory(input);
      expect(result).toMatchObject(input);
    });
  });
  ```

#### Integration Tests
- Test complete tool execution with typed requests and responses:
  ```typescript
  import type { CreateCategoryRequest, CreateCategoryResult } from './helpers/category-test.types';
  
  describe('create-category tool', () => {
    const { getClient } = useTestContext<CreateCategoryRequest, never, CreateCategoryResult>();

    it('should create a category successfully', async () => {
      const client = getClient();
      const result = await client.callTool({
        name: 'create-category',
        arguments: {
          categories: [{
            name: 'Test Category',
            handle: 'test-category',
            is_internal: false,
            is_active: true,
          }],
        },
      });
      expect(result.success).toBe(true);
    });
  });
  ```

#### Error Cases
- Test error handling with typed error responses:
  ```typescript
  import type { MedusaError } from '@medusajs/utils';
  
  describe('create-category validation', () => {
    it('should handle workflow errors', async () => {
      try {
        // Test code that should throw
      } catch (error) {
        expect(error).toBeInstanceOf(MedusaError);
        expect(error.type).toBe('invalid_data');
      }
    });
  });
  ```

### 3. Test Setup

#### Using Test Client
```typescript
import type { Result } from '../types';
import { useTestClient } from '../setup';

describe('Category Tools', () => {
  const { connectTestClient } = useTestClient();
  
  it('should create a category successfully', async () => {
    const { client } = await connectTestClient();

    const result = (await client.callTool({
      name: 'create-category',
      arguments: {
        categories: [{
          name: 'Test Category',
          handle: 'test-category',
          is_internal: false,
          is_active: true,
        }],
      },
    })) as Result;

    expect(result.success).toBe(true);
  });
});
```

#### Test Data Helpers
```typescript
import type { ProductCategoryDTO } from '@medusajs/types';

const createTestCategory = (overrides: Partial<ProductCategoryDTO> = {}) => ({
  name: 'Test Category',
  handle: 'test-category',
  is_internal: false,
  is_active: true,
  ...overrides,
});
```

### 4. Test Data Management

#### Factory Pattern with Type Safety
```typescript
import type { 
  ProductDTO,
  ProductCategoryDTO,
  ProductVariantDTO 
} from '@medusajs/types';

interface TestDataFactoryOptions {
  withVariants?: boolean;
  variantCount?: number;
  withCategories?: boolean;
  categoryCount?: number;
}

// Base factory function with proper typing and defaults
const createTestProduct = (
  overrides: Partial<ProductDTO> = {},
  options: TestDataFactoryOptions = {}
): ProductDTO => ({
  title: 'Test Product',
  handle: 'test-product',
  status: 'draft',
  is_giftcard: false,
  discountable: true,
  ...overrides,
});

// Variant factory with relationships
const createTestVariant = (
  product: ProductDTO,
  overrides: Partial<ProductVariantDTO> = {}
): ProductVariantDTO => ({
  title: 'Test Variant',
  sku: `TEST-SKU-${Date.now()}`,
  inventory_quantity: 10,
  product_id: product.id,
  ...overrides,
});

// Category factory with hierarchy support
const createTestCategory = (
  overrides: Partial<ProductCategoryDTO> = {}
): ProductCategoryDTO => ({
  name: 'Test Category',
  handle: 'test-category',
  is_internal: false,
  is_active: true,
  ...overrides,
});

// Complex data factory with relationships
const createTestData = async (options: TestDataFactoryOptions = {}) => {
  const product = createTestProduct();
  const data: { 
    product: ProductDTO;
    variants?: ProductVariantDTO[];
    categories?: ProductCategoryDTO[];
  } = { product };

  if (options.withVariants) {
    data.variants = Array.from({ length: options.variantCount || 1 })
      .map((_, i) => createTestVariant(product, {
        title: `Test Variant ${i + 1}`,
        sku: `TEST-SKU-${i + 1}`,
      }));
  }

  if (options.withCategories) {
    data.categories = Array.from({ length: options.categoryCount || 1 })
      .map((_, i) => createTestCategory({
        name: `Test Category ${i + 1}`,
        handle: `test-category-${i + 1}`,
      }));
  }

  return data;
};
```

#### Setup/Cleanup Hooks
```typescript
describe('Product Management Tests', () => {
  let testData: {
    product: ProductDTO;
    variants?: ProductVariantDTO[];
    categories?: ProductCategoryDTO[];
  };

  beforeAll(async () => {
    const { client } = await connectTestClient();
    // Create base test data for all tests
    testData = await createTestData({
      withVariants: true,
      variantCount: 2,
      withCategories: true,
    });
    
    // Persist test data
    await client.createProduct(testData.product);
    if (testData.variants) {
      await Promise.all(
        testData.variants.map(variant => 
          client.createProductVariant(variant)
        )
      );
    }
  });

  beforeEach(async () => {
    // Reset product state before each test
    const { client } = await connectTestClient();
    await client.updateProduct(testData.product.id, {
      status: 'draft',
    });
  });

  afterEach(async () => {
    // Cleanup test-specific data
    const { client } = await connectTestClient();
    await client.cleanupTestData();
  });

  afterAll(async () => {
    // Cleanup all test data
    const { client } = await connectTestClient();
    if (testData.variants) {
      await Promise.all(
        testData.variants.map(variant =>
          client.deleteProductVariant(variant.id)
        )
      );
    }
    await client.deleteProduct(testData.product.id);
  });
});
```

#### Transactional Testing Pattern
```typescript
import { withTransaction } from '../setup/transaction';

// Higher-order function for transaction management
const withTestTransaction = withTransaction((client) => ({
  async cleanup() {
    await client.cleanupTestData();
  },
}));

describe('Product Workflow Tests', () => {
  it('should create and publish product', 
    withTestTransaction(async (client) => {
      const { product } = await createTestData();
      const result = await client.createProduct(product);
      
      expect(result.id).toBeDefined();
      // Transaction automatically rolled back after test
    })
  );

  it('should handle variant creation', 
    withTestTransaction(async (client) => {
      const { product, variants } = await createTestData({
        withVariants: true,
        variantCount: 2,
      });
      
      const results = await Promise.all(
        variants!.map(variant => 
          client.createProductVariant(variant)
        )
      );
      
      expect(results).toHaveLength(2);
    })
  );
});
```

#### Data Verification Helpers
```typescript
const verifyTestDataCleanup = async (client: TestClient) => {
  const counts = await client.getTestDataCounts();
  expect(counts.products).toBe(0);
  expect(counts.variants).toBe(0);
  expect(counts.categories).toBe(0);
};

const verifyProductRelations = async (
  client: TestClient,
  productId: string,
  options: TestDataFactoryOptions
) => {
  const product = await client.getProduct(productId, {
    relations: ['variants', 'categories'],
  });
  
  if (options.withVariants) {
    expect(product.variants).toHaveLength(options.variantCount || 1);
  }
  
  if (options.withCategories) {
    expect(product.categories).toHaveLength(options.categoryCount || 1);
  }
};
```

## Testing Patterns

### 1. Schema Validation
```typescript
import { categoryBaseSchema } from '../schemas/category';
import type { CategoryBase } from '../schemas/category';

describe('category schema validation', () => {
  it('should validate required fields', () => {
    const testData: CategoryBase = {
      name: 'Test Category',
      handle: 'test-category',
      is_internal: false,
      is_active: true,
    };
    const result = categoryBaseSchema.safeParse(testData);
    expect(result.success).toBe(true);
  });
});
```

### 2. Workflow Integration
```typescript
import type { CreateProductCategoriesWorkflowInputDTO } from '@medusajs/core-flows';

describe('category workflow integration', () => {
  it('should execute workflow correctly', async () => {
    const input: CreateProductCategoriesWorkflowInputDTO = {
      product_categories: [{
        name: 'Test Category',
        handle: 'test-category',
      }],
    };
    const result = await client.callTool({
      name: 'create-category',
      arguments: input,
    });
    expect(result.success).toBe(true);
  });
});
```

### 3. Error Handling
```typescript
import type { MedusaError } from '@medusajs/utils';

describe('category error handling', () => {
  it('should handle workflow errors gracefully', async () => {
    try {
      await client.callTool({
        name: 'create-category',
        arguments: {
          categories: [{ name: '' }], // Invalid data
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(MedusaError);
      expect(error.type).toBe('invalid_data');
    }
  });
});
```

## Test Coverage Requirements

### 1. Schema Tests
- Validate all required fields using proper types
- Test optional field handling with partial types
- Verify default values
- Check constraint enforcement

### 2. Transformation Tests
- Test data transformation with source and target types
- Verify optional field handling
- Check metadata handling
- Validate relationship mapping

### 3. Workflow Tests
- Test successful execution with proper DTOs
- Verify error handling with typed errors
- Check response format matches expected types
- Test edge cases with valid types

### 4. Integration Tests
- End-to-end tool execution with full type coverage
- Cross-tool interactions with shared types
- State management with proper typing
- Transaction handling with typed results

## Best Practices

1. **Type Safety**
   - Always use Medusa types where available
   - Extend existing types rather than creating new ones
   - Use proper generics with test context
   - Maintain type safety in test helpers

2. **Isolation**
   - Each test should be independent
   - Clean up test data after each test
   - Don't rely on test order
   - Use typed test factories

3. **Readability**
   - Use descriptive test names
   - Group related tests
   - Document complex test setups
   - Use type annotations for clarity

4. **Maintenance**
   - Use typed test data factories
   - Share common setup code
   - Keep tests focused
   - Maintain type consistency

5. **Test Data Lifecycle**
   - Use factory functions with proper TypeScript types
   - Create reusable test data factories with relationship support
   - Clean up resources in reverse order of creation
   - Implement verification helpers for cleanup validation
   - Use transactions for automatic cleanup when possible
   - Keep test data isolated between test suites
   - Maintain referential integrity in test data
   - Version test data factories alongside schema changes
   - Document test data patterns in README

6. **Data Isolation**
   - Use unique identifiers for test data (timestamps, UUIDs)
   - Avoid shared mutable state between tests
   - Reset database state before each test suite
   - Use separate test databases for parallel test runs
   - Implement proper cascading deletes for cleanup

## Running Tests

### Using `yarn test:mcp`

1. **Basic Usage**
   ```bash
   yarn test:mcp
   ```
   This will run all MCP tests in the project.

2. **Running Specific Tests**
   ```bash
   # Run tests in a specific file
   yarn test:mcp categories.test.ts
   
   # Run tests matching a pattern
   yarn test:mcp -t "should create a category"
   ```

3. **Watch Mode**
   ```bash
   # Watch mode for all tests
   yarn test:mcp --watch
   
   # Watch specific files
   yarn test:mcp categories.test.ts --watch
   ```

4. **Coverage Reports**
   ```bash
   # Generate coverage report
   yarn test:mcp --coverage
   ```

### Test Output

The test runner will show:
- Test suite summary
- Individual test results
- Code coverage (if enabled)
- Execution time
- Failed test details with stack traces

### Debugging Tests

1. **Using Jest Debug Mode**
   ```bash
   # Add debugger statement in your test
   debugger;
   
   # Run with Node inspector
   node --inspect-brk $(yarn bin jest) --runInBand --config jest.config.mcp.js
   ```

### Best Practices for Test Execution

1. **Local Development**
   - Use watch mode for faster feedback
   - Run specific tests when working on a feature
   - Enable verbose output when debugging

2. **CI/CD Pipeline**
   - Always run full test suite
   - Generate coverage reports
   - Fail on coverage thresholds
   - Save test results as artifacts

3. **Performance**
   - Group related tests in describe blocks
   - Use beforeAll for expensive setup
   - Clean up resources in afterAll
   - Avoid unnecessary async operations

4. **Troubleshooting**
   - Use `--verbose` for detailed output
   - Check Jest timeout settings
   - Verify test environment variables
   - Review test database state

## Example Test Structure

```typescript
import type { ProductCategoryDTO } from '@medusajs/types';
import type { Result } from '@modelcontextprotocol/sdk/types.js';
import { useTestClient } from '../setup';
import { createTestCategory } from './helpers';

describe('Category Tools', () => {
  const { connectTestClient } = useTestClient();

  describe('create-category', () => {
    it('should create a single category', async () => {
      const { client } = await connectTestClient();
      const category = createTestCategory();
      
      const result = (await client.callTool({
        name: 'create-category',
        arguments: {
          categories: [category],
        },
      })) as Result;

      expect(result.success).toBe(true);
      expect(result.content[0].text).toContain(category.name);
    });

    it('should create hierarchical categories', async () => {
      const { client } = await connectTestClient();
      // Test parent-child relationships with proper types
    });

    it('should handle validation errors', async () => {
      const { client } = await connectTestClient();
      // Test invalid data with proper error types
    });
  });
});
```

## Testing Error Handling

### 1. Validation Error Testing
```typescript
describe('validation', () => {
  it('should validate required fields', async () => {
    const client = getClient();

    await expect(
      client.callTool({
        name: 'update-categories',
        arguments: {
          selector: { id: 'test-id' },
          update: {},
        },
      }),
    ).rejects.toThrow(/at least one update field is required/i);
  });

  it('should validate metadata format', async () => {
    const client = getClient();
    const category = createTestCategory();
    const createResponse = await createTestData(client, category);

    await expect(
      client.callTool({
        name: 'update-categories',
        arguments: {
          selector: { id: createResponse.categories[0].id },
          update: { metadata: 'invalid-metadata' as any },
        },
      }),
    ).rejects.toThrow(/metadata.*must be.*object/i);
  });
});
```

Key validation testing patterns:
1. Use `expect().rejects.toThrow()` for async validation errors
2. Use regex patterns to match error messages flexibly
3. Test both required field validation and field format validation
4. Include type validation for TypeScript interfaces
5. Test edge cases with invalid data types

### 2. MCP Server Error Testing
```typescript
describe('error handling', () => {
  it('should handle non-existent resources', async () => {
    const client = getClient();

    await expect(
      client.callTool({
        name: 'update-categories',
        arguments: {
          selector: { id: 'non-existent-id' },
          update: { name: 'New Name' },
        },
      }),
    ).rejects.toThrow(/no categories found/i);
  });

  it('should handle invalid relationships', async () => {
    const client = getClient();
    const category = await createAndPersistCategory(client);

    await expect(
      client.callTool({
        name: 'update-categories',
        arguments: {
          selector: { id: category.id },
          update: { parent_category_id: 'invalid-id' },
        },
      }),
    ).rejects.toThrow(/parent category.*was not found/i);
  });

  it('should handle circular references', async () => {
    const client = getClient();
    const category = await createAndPersistCategory(client);

    await expect(
      client.callTool({
        name: 'update-categories',
        arguments: {
          selector: { id: category.id },
          update: { parent_category_id: category.id },
        },
      }),
    ).rejects.toThrow(/circular.*reference/i);
  });
});
```

Key server error testing patterns:
1. Test resource not found scenarios
2. Test invalid relationship references
3. Test business logic constraints (e.g., circular references)
4. Test concurrent modification conflicts
5. Test server-side validation rules

### 3. Error Response Types
```typescript
// Define expected error response types
interface ErrorResponse {
  error: boolean;
  message: string;
  details?: Record<string, unknown>;
}

// Type guard for error responses
const isErrorResponse = (response: unknown): response is ErrorResponse => {
  return typeof response === 'object' && 
    response !== null &&
    'error' in response &&
    'message' in response;
};

// Test helper for error responses
const expectErrorResponse = async (
  promise: Promise<unknown>,
  errorPattern: RegExp
) => {
  try {
    await promise;
    fail('Expected promise to reject');
  } catch (error) {
    if (!isErrorResponse(error)) {
      throw new Error('Unexpected error type');
    }
    expect(error.message).toMatch(errorPattern);
    expect(error.error).toBe(true);
  }
};
```

### 4. Test Data Setup for Error Cases
```typescript
// Helper to create test data for error scenarios
const createErrorTestData = async (
  client: TestClient,
  options: {
    withDuplicates?: boolean;
    withInvalidRelations?: boolean;
    withCircularReferences?: boolean;
  } = {}
) => {
  const testData = {
    categories: [] as ProductCategoryDTO[],
    cleanup: async () => {
      await Promise.all(
        testData.categories.map(cat => 
          client.deleteCategory(cat.id)
        )
      );
    },
  };

  // Setup data based on test requirements
  if (options.withDuplicates) {
    const base = createTestCategory();
    testData.categories.push(
      await createCategory(client, base),
      await createCategory(client, { ...base, id: undefined })
    );
  }

  return testData;
};

// Usage in tests
describe('error scenarios', () => {
  let testData: ReturnType<typeof createErrorTestData>;

  beforeEach(async () => {
    testData = await createErrorTestData(client, {
      withDuplicates: true,
    });
  });

  afterEach(async () => {
    await testData.cleanup();
  });

  it('should handle duplicate data', async () => {
    // Test implementation
  });
});
```

### 5. Best Practices for Error Testing

1. **Test Organization**
   - Group related error tests in descriptive `describe` blocks
   - Separate validation errors from server errors
   - Use clear, specific test names that describe the error case

2. **Error Patterns**
   - Use regex patterns for flexible message matching
   - Include case-insensitive flags for robust matching
   - Test both error presence and specific error content

3. **Test Data Management**
   - Create specific test data for error scenarios
   - Clean up test data even if tests fail
   - Use helper functions for common error test setups

4. **Type Safety**
   - Define and use proper error response types
   - Include type guards for error checking
   - Maintain type safety in error test helpers

5. **Coverage Requirements**
   - Test all validation rules
   - Test all business logic constraints
   - Test edge cases and boundary conditions
   - Test concurrent modification scenarios
   - Test server-side validation rules

6. **Error Response Verification**
   - Verify error response structure
   - Check error message content
   - Validate error details when present
   - Ensure proper error typing

7. **Async Error Handling**
   - Use proper async/await patterns
   - Handle promise rejections correctly
   - Test timeout scenarios
   - Verify error propagation

8. **Documentation**
   - Document expected error cases
   - Include example error responses
   - Document error handling patterns
   - Maintain error code reference 
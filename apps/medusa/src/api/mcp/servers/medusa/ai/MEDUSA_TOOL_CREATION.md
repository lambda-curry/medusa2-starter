# Creating Tools for Medusa MCP (Model Control Protocol)

This guide outlines best practices and patterns for creating tools that interact with Medusa through the Model Control Protocol (MCP).

## Table of Contents
- [Tool Structure](#tool-structure)
- [Using Medusa Workflows](#using-medusa-workflows)
- [Best Practices](#best-practices)
- [Schema Organization](#schema-organization)
- [Helper Function Patterns](#helper-function-patterns)
- [Response Formatting](#response-formatting)
- [Example Implementations](#example-implementations)
- [Tool Categories](#tool-categories)

## Tool Structure

Every Medusa MCP tool follows this basic structure:

```typescript
import { z } from 'zod';
import type { McpTool } from '../types';
import { createProductsWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';
import { mySharedSchema } from './domain-tools.schemas';
import { transformData } from './domain-tools.helpers';

export const toolSchema = z.object({
  // Define input parameters using Zod
  // Consider using shared schemas from domain-tools.schemas.ts
});

export const tool: McpTool<typeof toolSchema> = {
  name: 'tool-name',
  description: 'Clear description of what the tool does',
  schema: toolSchema,
  execute: async (args, { req, logger }) => {
    try {
      // Implementation using workflows and shared helpers
    } catch (error) {
      return handleToolError(error, args, logger);
    }
  }
};
```

### Key Components

1. **Schema Organization**
   - Place shared schemas in `domain-tools.schemas.ts`
   - Place shared transformations in `domain-tools.helpers.ts`
   - Keep domain-specific code together (e.g., products/, orders/)

2. **Tool Configuration**
   - `name`: Unique identifier in kebab-case
   - `description`: Clear, concise purpose statement
   - `schema`: Zod schema (consider using shared schemas)
   - `execute`: Async function implementing the tool's logic

3. **Error Handling**
   - Always wrap execution in try-catch
   - Use the `handleToolError` helper for consistent error handling
   - Log errors with appropriate context

### File Organization

Each tool should:
- Have its own dedicated file with an action-oriented name (`verb-noun.ts`)
- Use plural forms for entities when appropriate (`inventory-items.ts` not `inventory-item.ts`)
- Group shared schemas in a domain-specific `domain-tools.schemas.ts` file
- Group shared helper functions in a domain-specific `domain-tools.helpers.ts` file

Example directory structure:
```
/inventory/
  create-inventory-items.ts
  update-inventory-levels.ts
  fetch-inventory-items.ts
  inventory-tools.schemas.ts
  inventory-tools.helpers.ts
```

## Schema Organization

### Domain-Specific Schemas

Create a `domain-tools.schemas.ts` file for each domain:

```typescript
// products/product-tools.schemas.ts
import { z } from 'zod';

// Base schemas for reuse
export const dimensionsSchema = z.object({
  weight: z.number().optional(),
  length: z.number().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
});

// Composed schemas
export const productSchema = z.object({
  // ... schema definition
}).merge(dimensionsSchema);

// Types
export type Product = z.infer<typeof productSchema>;

// API Response types
export interface ProductResponse extends Omit<Product, 'someField'> {
  // ... response-specific fields
}
```

### Domain-Specific Helpers

Create a `domain-tools.helpers.ts` file for shared transformations:

```typescript
// products/product-tools.helpers.ts
import type { Product, ProductResponse } from './product-tools.schemas';

export const transformProduct = (input: Product): ProductResponse => ({
  // ... transformation logic
});
```

### Schema Composition and Reuse

Organize schemas hierarchically:
- Create base schemas for core properties
- Extend these for more specific use cases
- Export typed interfaces using `z.infer<typeof schemaName>`

Example:
```typescript
// Base schema with core properties
export const baseEntitySchema = z.object({
  name: z.string().describe('Name of the entity'),
  description: z.string().optional().describe('Description of the entity'),
});

// Extended schema for specific use case
export const createEntitySchema = baseEntitySchema.extend({
  category_id: z.string().describe('Category this entity belongs to'),
});

// Type exports
export type BaseEntity = z.infer<typeof baseEntitySchema>;
export type CreateEntityInput = z.infer<typeof createEntitySchema>;
```

Always provide detailed descriptions for each field to enable good documentation.

## Helper Function Patterns

Create consistent helper functions to increase maintainability:

### Service Resolution Helpers

```typescript
export const getEntityService = (container: MedusaContainer): EntityService => {
  const service = container.resolve('entityService') as EntityService;
  if (!service) {
    throw new Error('Entity service not found in container');
  }
  return service;
};
```

### Response Formatting Helpers

```typescript
export const formatEntityResponse = (entity: any) => {
  if (!entity) return null;
  
  return {
    id: entity.id,
    name: entity.name,
    // Format nested properties consistently
    items: entity.items?.map(formatItemResponse) || [],
    // Add computed properties if needed
    total_value: calculateTotalValue(entity),
    created_at: entity.created_at,
    updated_at: entity.updated_at,
  };
};
```

These helpers ensure:
1. Consistent typing for services
2. Uniform response structures across related tools
3. Separation of business logic from data formatting

## Using Medusa Workflows

Medusa provides a powerful workflow system that handles complex operations with proper error handling, validation, and transaction management. This is the preferred way to interact with Medusa in your tools.

### Examples of Available Workflows

```typescript
import {
  createProductsWorkflow,
  createProductCategoriesWorkflow,
  createProductTagsWorkflow,
  createCollectionsWorkflow,
  createOrderWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  updateStoresWorkflow,
} from '@medusajs/core-flows';
```

### Workflow Pattern

Workflows follow a consistent pattern:

1. **Input DTOs**: Each workflow accepts a strongly-typed input DTO
2. **Container Resolution**: Workflows are resolved from the container
3. **Execution**: Workflows are executed using the `run()` method
4. **Result Handling**: Results are returned in a standardized format

Example:
```typescript
import { createProductsWorkflow } from '@medusajs/core-flows';
import type { CreateProductWorkflowInputDTO } from '@medusajs/framework/types';

// In your tool's execute function:
const { result } = await createProductsWorkflow(container).run({
  input: {
    products: [
      {
        title: "Product Title",
        description: "Product Description",
        // ... other product fields
        variants: [
          {
            title: "Default Variant",
            prices: [
              {
                amount: 1000,
                currency_code: "usd"
              }
            ]
          }
        ]
      }
    ]
  }
});
```

### Benefits of Using Workflows

1. **Transaction Management**: Workflows handle database transactions automatically
2. **Validation**: Input validation is built into the workflow
3. **Error Handling**: Workflows provide consistent error handling
4. **Event Emission**: Proper events are emitted during the workflow
5. **Extensibility**: Workflows can be extended with plugins

### Common Workflow Patterns

#### 1. Creating Resources

```typescript
// Product Creation
const { result: products } = await createProductsWorkflow(container).run({
  input: {
    products: productData
  }
});

// Category Creation
const { result: categories } = await createProductCategoriesWorkflow(container).run({
  input: {
    product_categories: categoryData
  }
});

// Collection Creation
const { result: collections } = await createCollectionsWorkflow(container).run({
  input: {
    collections: collectionData
  }
});
```

#### 2. Updating Resources

```typescript
// Store Update
await updateStoresWorkflow(container).run({
  input: {
    selector: { id: storeId },
    update: updateData
  }
});
```

#### 3. Complex Operations

```typescript
// Order Creation with Multiple Steps
const { result: order } = await createOrderWorkflow(container).run({
  input: {
    email: "customer@example.com",
    shipping_address: {
      first_name: "John",
      last_name: "Doe",
      address_1: "123 Main St",
      city: "Austin",
      country_code: "US",
      postal_code: "78701"
    },
    items: [
      {
        variant_id: "variant_123",
        quantity: 1
      }
    ],
    region_id: "region_123",
    sales_channel_id: "channel_123"
  }
});
```

### Selecting the Right Workflow

When choosing which workflow to use:

1. **Look for an exact match**: Use dedicated workflows for specific operations when available
   ```typescript
   const { result } = await createProductsWorkflow(container).run({
     input: { products: productData }
   });
   ```

2. **Consider composing workflows**: For complex operations, chain multiple workflows
   ```typescript
   // First create the product
   const { result: product } = await createProductsWorkflow(container).run({
     input: { products: [productData] }
   });
   
   // Then handle related entities
   await createProductTagsWorkflow(container).run({
     input: { tags: tagData, product_id: product.id }
   });
   ```

3. **Fall back to service methods**: Only when no workflow exists
   ```typescript
   const service = getEntityService(container);
   const result = await service.performSpecialOperation(data);
   ```

## Response Formatting

Return responses with a consistent structure to improve user experience:

```typescript
return {
  content: [{
    type: 'text',
    text: JSON.stringify({
      // A clear message about what happened
      message: `Successfully created ${results.length} entities`,
      
      // The primary data of the response
      entities: formattedResults,
      
      // Optional metadata about the operation
      count: results.length,
      
      // Optional pagination info when relevant
      pagination: {
        limit,
        offset,
        total: count,
      },
    }, null, 2),
  }],
};
```

Always apply formatting helpers to ensure consistent output structure across tools.

## Best Practices

### 1. Schema Organization
```typescript
// Bad: Duplicating schemas across tools
const dimensionsSchema = z.object({ ... });

// Good: Using shared schemas
import { dimensionsSchema } from './product-tools.schemas';
```

### 2. Type Safety
```typescript
// Bad: Using any or unknown types
interface SomeType {
  data: any;
}

// Good: Using inferred types from schemas
import type { Product } from './product-tools.schemas';
type SomeType = {
  data: Product;
}
```

### 3. Transformations
```typescript
// Bad: Duplicating transformation logic
const transform = (data) => ({ ... });

// Good: Using shared helpers
import { transformProduct } from './product-tools.helpers';
const result = transformProduct(data);
```

### 4. Input Validation
```typescript
// Good
const schema = z.object({
  id: z.string().describe('The unique identifier of the resource'),
  limit: z.number()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .describe('Maximum number of items to return (1-100)'),
});

// Avoid
const schema = z.object({
  id: z.any(),
  limit: z.number(),
});
```

### 5. Error Handling
```typescript
import { handleToolError } from './helpers';

try {
  // Implementation
} catch (error) {
  return handleToolError(error, args, logger);
}
```

The `handleToolError` helper provides:
1. Standardized error response format
2. Special handling for validation errors
3. Consistent logging
4. Input parameter context

For implementation details, see `tools/helpers.ts`.

### Error Handling Best Practices

1. **Validate context before execution**:
   ```typescript
   if (!req) throw new Error('Request context not set');
   ```

2. **Log operation details**:
   ```typescript
   logger.info(`Creating ${items.length} inventory items`);
   ```

3. **Verify operation success**:
   ```typescript
   if (!result) {
     throw new Error('Failed to create inventory items');
   }
   ```

4. **Include specific business rule errors**:
   ```typescript
   if (newQuantity < 0) {
     throw new Error(
       `Adjustment would result in negative inventory for item ${id}`
     );
   }
   ```

5. **Use the standard error handler**:
   ```typescript
   catch (error) {
     return handleToolError(error, args, logger);
   }
   ```

### 6. Response Format
```typescript
return {
  content: [{
    type: 'text',
    text: JSON.stringify({
      data,
      count: metadata.count,
    }, null, 2),
  }],
};
```

## Example Implementations

### Product Creation Tool

```typescript
import { z } from 'zod';
import type { McpTool } from './types';
import { createProductsWorkflow } from '@medusajs/core-flows';
import type { CreateProductWorkflowInputDTO } from '@medusajs/framework/types';
import { handleToolError } from './helpers';

const productSchema = z.object({
  title: z.string().describe('The title of the product'),
  description: z.string().optional().describe('Product description'),
  collection_id: z.string().optional().describe('Collection ID'),
  variants: z.array(z.object({
    title: z.string(),
    sku: z.string().optional(),
    prices: z.array(z.object({
      amount: z.number(),
      currency_code: z.string()
    }))
  })).min(1).describe('At least one variant is required')
});

export const createProductTool: McpTool<typeof productSchema> = {
  name: 'create-product',
  description: 'Create a new product with variants',
  schema: productSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      const productInput: CreateProductWorkflowInputDTO = {
        products: [{
          title: args.title,
          description: args.description,
          collection_id: args.collection_id,
          variants: args.variants.map(variant => ({
            title: variant.title,
            sku: variant.sku,
            prices: variant.prices
          }))
        }]
      };

      const { result } = await createProductsWorkflow(req.scope).run({
        input: productInput
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            products: result.map(p => ({
              id: p.id,
              title: p.title,
              variants: p.variants.map(v => ({
                id: v.id,
                title: v.title
              }))
            })),
            message: 'Successfully created product'
          }, null, 2)
        }]
      };
    } catch (error) {
      return handleToolError(error, args, logger);
    }
  }
};
```

### Note on Medusa Workflows
Workflows provide standardized ways to interact with Medusa's core functionality. Each workflow:
- Handles database transactions
- Validates input data
- Manages error handling
- Emits appropriate events
- Can be extended with plugins

When creating tools, prefer using these workflows over direct database operations or custom implementations. 
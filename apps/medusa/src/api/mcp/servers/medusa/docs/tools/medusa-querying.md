# Query in Medusa

## Overview

Query is a powerful data fetching mechanism in Medusa that allows you to retrieve data across different modules, including both commerce and custom modules. It's registered in the Medusa container under the `query` key and provides a unified way to access and manipulate data.

## Best Practices

### Field Selection
- Define base fields that are always included
- Allow optional field expansion through parameters
- Use explicit field paths for nested data
- Group related fields logically

### Error Handling
- Implement proper error handling and logging
- Validate request context
- Return meaningful error messages

### Logging
- Log important operations with relevant context
- Include input parameters in logs
- Log success metrics (e.g., number of items retrieved)

## Basic Usage

### Resolving Query

To use Query in your API routes or workflows, resolve it from the Medusa container:

```typescript
const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
```

### Single Item Query

To fetch a single item by ID:

```typescript
const { data: [product] } = await query.graph({
  entity: 'product',
  fields: baseFields,
  filters: { id }
});
```

### Comprehensive Query Example

Here's a complete example demonstrating best practices for querying products:

```typescript
// Define base fields that are always included
const baseFields = [
  'id', 
  'title', 
  'description', 
  'handle', 
  'thumbnail', 
  'status', 
  'created_at', 
  'updated_at'
];

// Add optional expanded fields based on user request
if (expand?.includes('variants')) {
  baseFields.push(
    'variants.id',
    'variants.title',
    'variants.sku',
    'variants.inventory_quantity',
    'variants.prices.*'
  );
}

// Execute the query with pagination and ordering
const { data: products, metadata } = await query.graph({
  entity: 'product',
  fields: baseFields,
  pagination: {
    skip: offset,
    take: limit,
    order: order ? { [order.field]: order.direction } : undefined,
  },
});
```

## Advanced Querying Features

### Field Expansion
Control which related entities to include in the response:

```typescript
const expandableFields = {
  variants: [
    'variants.id',
    'variants.title',
    'variants.sku',
    'variants.inventory_quantity',
    'variants.prices.*'
  ],
  categories: [
    'categories.id',
    'categories.name',
    'categories.handle'
  ],
  collection: [
    'collection.id',
    'collection.title',
    'collection.handle'
  ],
  options: [
    'options.id',
    'options.title',
    'options.values'
  ],
  tags: [
    'tags.id',
    'tags.value'
  ]
};
```

### Pagination and Sorting

Implement flexible pagination and sorting:

```typescript
const { 
  data,
  metadata: { count }
} = await query.graph({
  entity: "product",
  fields: baseFields,
  pagination: {
    skip: offset,
    take: limit,
    order: {
      created_at: "DESC" // Default sorting
    },
  },
})

// Return standardized response format
return {
  products: data,
  count: metadata.count,
  pagination: {
    offset,
    limit,
    total: count,
  },
}
```

### Response Format

Return consistent, well-structured responses:

```typescript
{
  "products": [...],
  "count": 100,
  "pagination": {
    "offset": 0,
    "limit": 10,
    "total": 100
  }
}
```

## API Route Integration

### Parameter Validation

Use Zod schema for query parameters:

```typescript
const querySchema = z.object({
  query: z.string().optional()
    .describe('Search query to filter by searchable fields'),
  limit: z.number().min(1).max(100).optional().default(10)
    .describe('Maximum number of items per page (1-100)'),
  offset: z.number().min(0).optional().default(0)
    .describe('Number of items to skip'),
  order: z.object({
    field: z.enum(['title', 'created_at', 'updated_at']).default('created_at'),
    direction: z.enum(['ASC', 'DESC']).default('DESC'),
  }).optional(),
  expand: z.array(z.enum(['variants', 'categories', 'collection', 'options', 'tags']))
    .optional()
    .describe('Relations to expand in the response'),
});
```

### Error Handling

Implement comprehensive error handling:

```typescript
try {
  // Your query logic here
} catch (error) {
  logger.error(`Error fetching data: ${error.message}`);
  throw new Error(`Failed to fetch data: ${error.message}`);
}
```

## Query Parameters

Standard URL query parameters:
- `id`: Specific item ID to fetch a single record
- `query`: Search/filter term
- `limit`: Items per page (1-100)
- `offset`: Pagination offset
- `order`: Sort configuration (field:direction)
- `expand`: Relations to include

Example requests:
```
GET /products?limit=10&offset=0&order=created_at:DESC&expand=variants,categories  # List products with filters
```
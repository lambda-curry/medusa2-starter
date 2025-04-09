# Updating Product Categories

This document outlines how to use the `updateProductCategoriesStep` workflow step for updating product categories in Medusa.

## Overview

The `updateProductCategoriesStep` is a workflow step that enables updating one or multiple product categories based on selector filters. This step is used in the core product category update workflow and can be integrated into custom workflows.

## Input Schema

The step accepts input conforming to the `UpdateProductCategoriesWorkflowInput` interface:

```typescript
interface UpdateProductCategoriesWorkflowInput {
  /**
   * The filters to select the product categories to update.
   */
  selector: FilterableProductCategoryProps

  /**
   * The data to update in the product categories.
   */
  update: UpdateProductCategoryDTO
}
```

### Parameters

#### selector
The `selector` parameter uses `FilterableProductCategoryProps` to filter which categories to update:

- `id`: String - Update a specific category by ID
- `handle`: String - Filter by category handle
- `parent_category_id`: String - Filter by parent category
- Additional filters as supported by the [List Categories API](https://docs.medusajs.com/api/admin#product-categories_getproductcategories)

#### update
The `update` parameter accepts an `UpdateProductCategoryDTO` with the following fields:

- `name`: String - The category name
- `description`: String - Category description
- `handle`: String - URL-friendly identifier
- `is_active`: Boolean - Category visibility status
- `is_internal`: Boolean - Internal use flag
- `rank`: Number - Display order position
- `parent_category_id`: String - Parent category reference
- `metadata`: Record<string, unknown> - Custom metadata object

## Usage Examples

### Single Category Update

```typescript
const result = await updateProductCategoriesStep({
  selector: { 
    id: "pcat_123" 
  },
  update: {
    name: "New Category Name",
    is_active: false
  }
})
```

### Batch Update

```typescript
const batchResult = await updateProductCategoriesStep({
  selector: { 
    parent_category_id: "pcat_456",
    is_internal: false
  },
  update: {
    is_internal: true
  }
})
```

## Response

The step returns a `StepResponse` containing:

- Array of updated category objects
- Previous state (for rollback capability)
- Status information

## Key Features

1. **Relationship Handling**
   - Automatically manages parent-child category relationships
   - Validates category hierarchy integrity

2. **Data Safety**
   - Uses soft delete pattern for safe operations
   - Maintains audit trail through metadata

3. **Batch Operations**
   - Supports updating multiple categories in one operation
   - Maintains transactional integrity

4. **Automatic Processing**
   - Handles rank reordering when needed
   - Updates related metadata
   - Manages category tree structure

## Related Documentation

- [Product Category API Documentation](https://docs.medusajs.com/api/admin#product-categories)
- [Update Category API Endpoint](https://docs.medusajs.com/api/admin#product-categories_postproductcategoriesid)
- [List Categories API](https://docs.medusajs.com/api/admin#product-categories_getproductcategories)

## Best Practices

1. **Selector Usage**
   - Use specific selectors when possible to limit scope
   - Combine multiple filters for precise targeting
   - Test selectors with list API first

2. **Update Operations**
   - Update only necessary fields
   - Use metadata for custom fields
   - Consider impact on child categories

3. **Error Handling**
   - Implement try-catch blocks
   - Check response status
   - Handle rollback scenarios if needed

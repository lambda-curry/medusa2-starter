# Updating Products

This guide explains how to update products using the Update Products workflow in Medusa.

## Overview

The Update Products workflow allows you to update one or more products along with their variants and options. You can update products either by specifying a list of products or by using a selector to filter products.

## Methods of Updating

### 1. Update Specific Products

You can update specific products by providing an array of products with their updates:

```ts
const { result } = await updateProductsWorkflow(container)
.run({
  input: {
    products: [
      {
        id: "prod_123",
        title: "Shirts"
      },
      {
        id: "prod_321",
        variants: [
          {
            id: "variant_123",
            options: {
              Size: "S"
            }
          }
        ]
      }
    ],
    additional_data: {
      erp_id: "erp_123"
    }
  }
})
```

## Input Parameters

### Update by Products List

When updating specific products, the input should include:

- `products`: Array of products to update, each containing:
  - `id`: Product ID
  - `title`: (optional) Product title
  - `variants`: (optional) Array of variant updates
  - `sales_channels`: (optional) Array of sales channel IDs
- `additional_data`: (optional) Custom data to pass to workflow hooks


## Example Use Cases

1. Bulk update product descriptions
2. Update product variants across multiple products
3. Add products to sales channels
4. Update custom fields using additional_data

## Notes

- The workflow is used internally by the Update Product Admin API Route
- You can extend the workflow's functionality using hooks
- Custom data can be passed through additional_data for integration with external systems

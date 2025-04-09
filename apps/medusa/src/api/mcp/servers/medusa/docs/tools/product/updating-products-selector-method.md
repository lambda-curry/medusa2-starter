# Using updateProductsWorkflow with Selector Method

The updateProductsWorkflow in Medusa allows you to update multiple products that match certain criteria using a selector. This method is particularly useful when you need to update a group of products with similar characteristics.

## Import the Workflow

First, import the updateProductsWorkflow from the Medusa core flows:

```ts
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
```

## Structure of the Selector Method

The selector method uses two main components:

- `selector`: Defines the criteria to select products for updating.
- `update`: Specifies the data to update on the selected products.

## Example Usage

Here's an example of how to use the updateProductsWorkflow with the selector method:

```ts
const { result } = await updateProductsWorkflow(req.scope)
  .run({
    input: {
      selector: {
        type_id: ["ptyp_123"]
      },
      update: {
        description: "This is an updated product description"
      },
      additional_data: {
        erp_id: "erp_123"
      }
    }
  })
```

## Input Parameters

The input object for the selector method contains the following properties:

- `selector`: An object of type `FilterableProductProps` that specifies the criteria for selecting products to update.
- `update`: An object of type `UpdateProductDTO` that defines the data to update on the selected products.
- `additional_data` (optional): An object for passing custom data that can be used in workflow hooks.

## Selector Options

The selector can use various properties to filter products. Some common options include:

- `id`: Product ID
- `title`: Product title
- `handle`: Product handle
- `type_id`: Product type ID
- `collection_id`: Collection ID
- `tags`: Product tags

For a full list of filterable properties, refer to the `FilterableProductProps` interface in the Medusa documentation.

## Update Options

The update object can include any properties of the product that you want to modify. Common updateable fields include:

- `title`: Product title
- `description`: Product description
- `handle`: Product handle
- `status`: Product status
- `thumbnail`: Product thumbnail
- `variants`: Product variants

Refer to the `UpdateProductDTO` interface in the Medusa documentation for a complete list of updateable properties.

## Error Handling

When using the workflow, make sure to implement proper error handling:

```ts
try {
  const { result } = await updateProductsWorkflow(req.scope)
    .run({
      input: {
        selector: { /* your selector */ },
        update: { /* your update data */ }
      }
    })
  // Handle successful update
} catch (error) {
  // Handle error
  console.error("Error updating products:", error)
}
```

## Conclusion

Using the updateProductsWorkflow with the selector method provides a powerful way to update multiple products in Medusa based on specific criteria. This approach is efficient for bulk updates and can be easily integrated into your Medusa-based e-commerce application.

Remember to adjust the selector and update parameters according to your specific use case and data structure.

## Related Resources

- [batchProductsWorkflow - Medusa Core Workflows Reference](link-to-batch-products-workflow)
- [Product Workflows](link-to-product-workflows)
- [updateProductCategoriesStep - Medusa Core Workflows Reference](link-to-update-product-categories)

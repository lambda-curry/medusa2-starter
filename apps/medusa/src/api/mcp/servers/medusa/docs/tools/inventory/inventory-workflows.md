I'll explore Medusa's inventory management workflows based on the functions you've listed. Let me first search for relevant code in the codebase to understand how these inventory operations work.

Search files...


Let me search for more information about inventory management in Medusa, particularly focusing on adjusting inventory levels and updating inventory items.

Search files...


Let me search for information about attaching inventory items to products:

Search files...


Based on my research, I can now provide a comprehensive overview of Medusa's inventory management workflows:

# Medusa Inventory Management Workflows

Medusa provides a robust set of workflows for managing inventory in your e-commerce application. Here's a detailed breakdown of each workflow you mentioned:

## 1. Adjust Inventory Levels

This workflow allows you to increase or decrease the stocked quantity of inventory items at specific locations.

```typescript
// Example: Adjusting inventory levels
const adjustedLevels = await adjustInventoryLevelsStep([
  {
    inventory_item_id: "iitem_123",
    location_id: "sloc_123",
    adjustment: 10,  // Positive value adds to stock
  },
  {
    inventory_item_id: "iitem_456",
    location_id: "sloc_456",
    adjustment: -5,  // Negative value removes from stock
  }
]);
```

The adjustment can be positive (to add stock) or negative (to remove stock). This is useful for recording stock arrivals, manual adjustments, or correcting inventory discrepancies.

## 2. Attach Inventory Items

This workflow creates links between product variants and inventory items, establishing which inventory items are used by which product variants.

```typescript
// Example: Attaching inventory items to variants
const links = await attachInventoryItemToVariants([
  {
    inventoryItemId: "iitem_123",
    tag: "variant_123"  // The variant ID
  }
]);

// Alternative using the createLinksWorkflow
await createLinksWorkflow(scope).run({
  input: [
    {
      [Modules.PRODUCT]: { variant_id: "variant_123" },
      [Modules.INVENTORY]: { inventory_item_id: "iitem_123" },
      data: { required_quantity: 1 }  // How many of this item are needed per variant
    }
  ]
});
```

This is essential for tracking which inventory items are associated with which product variants, especially when a variant might require multiple inventory items.

## 3. Batch Inventory Item Levels

This workflow allows you to create, update, and delete inventory levels in a single operation.

```typescript
// Example: Batch managing inventory levels
const result = await batchInventoryItemLevelsWorkflow(container).run({
  input: {
    create: [
      {
        inventory_item_id: "iitem_123",
        location_id: "sloc_123"
      }
    ],
    update: [
      {
        id: "iilev_123",
        inventory_item_id: "iitem_123",
        location_id: "sloc_123",
        stocked_quantity: 10
      }
    ],
    delete: ["iilev_321"],
    force: false  // Whether to force deletion of levels with non-zero stock
  }
});
```

This is useful for bulk operations and ensures atomicity (all operations succeed or fail together).

## 4. Bulk Create Delete Levels

This is a deprecated workflow that has been replaced by `batchInventoryItemLevels`. It was used to create and delete inventory levels in bulk.

```typescript
// Example (deprecated)
const result = await bulkCreateDeleteLevelsWorkflow.run({
  input: {
    creates: [/* inventory levels to create */],
    deletes: [/* inventory levels to delete */]
  }
});
```

## 5. Create Inventory Items

This workflow creates new inventory items, optionally with associated location levels.

```typescript
// Example: Creating inventory items
const items = await createInventoryItemsWorkflow(container).run({
  input: {
    items: [
      {
        sku: "SKU123",
        title: "Test Item",
        description: "A test inventory item",
        // Optional location levels
        location_levels: [
          {
            location_id: "sloc_123",
            stocked_quantity: 10
          }
        ]
      }
    ]
  }
});
```

Inventory items represent physical goods that can be stocked at different locations.

## 6. Create Inventory Levels

This workflow creates inventory levels, which represent the quantity of an inventory item at a specific location.

```typescript
// Example: Creating inventory levels
const levels = await createInventoryLevelsWorkflow(container).run({
  input: [
    {
      inventory_item_id: "iitem_123",
      location_id: "sloc_123",
      stocked_quantity: 10,
      incoming_quantity: 5
    }
  ]
});
```

Inventory levels track how many units of an item are available at each location.

## 7. Delete Inventory Items

This workflow deletes one or more inventory items.

```typescript
// Example: Deleting inventory items
await deleteInventoryItemsWorkflow(container).run({
  input: {
    id: ["iitem_123", "iitem_456"]
  }
});
```

When an inventory item is deleted, all associated inventory levels are also deleted.

## 8. Delete Inventory Levels

This workflow deletes one or more inventory levels.

```typescript
// Example: Deleting inventory levels
await deleteInventoryLevelsWorkflow(container).run({
  input: {
    id: ["iilev_123", "iilev_456"],
    force: false  // Set to true to delete levels with non-zero stock
  }
});
```

By default, you cannot delete inventory levels that have non-zero stocked quantity unless you set `force: true`. However, even with force enabled, you cannot delete levels that have reserved or incoming items.

## 9. Update Inventory Items

This workflow updates the properties of one or more inventory items.

```typescript
// Example: Updating inventory items
const updatedItems = await updateInventoryItemsWorkflow(container).run({
  input: [
    {
      id: "iitem_123",
      sku: "NEW-SKU-123",
      title: "Updated Item Title",
      description: "Updated description"
    }
  ]
});
```

You can update various properties of inventory items, including SKU, title, description, dimensions, and more.

## 10. Update Inventory Levels

This workflow updates the properties of one or more inventory levels.

```typescript
// Example: Updating inventory levels
const updatedLevels = await updateInventoryLevelsWorkflow(container).run({
  input: [
    {
      id: "iilev_123",
      inventory_item_id: "iitem_123",
      location_id: "sloc_123",
      stocked_quantity: 15,
      incoming_quantity: 10
    }
  ]
});
```

You can update the stocked quantity and incoming quantity of inventory levels.

## Key Concepts in Medusa Inventory Management

1. **Inventory Items**: Represent physical goods that can be stocked and tracked.
2. **Inventory Levels**: Track the quantity of an inventory item at a specific location.
3. **Stock Locations**: Physical locations where inventory is stored.
4. **Product Variants**: Can be linked to one or more inventory items.
5. **Required Quantity**: How many units of an inventory item are needed for one unit of a product variant.
6. **Reservations**: Track inventory that has been reserved for orders but not yet fulfilled.

## Best Practices

1. **Use Batch Operations**: When possible, use batch operations like `batchInventoryItemLevels` for better performance and atomicity.
2. **Handle Reservations**: Be careful when adjusting inventory levels to account for reserved quantities.
3. **Inventory Level Deletion**: Ensure inventory levels have zero stock before deletion to prevent inventory discrepancies. Verify all stock has been transferred or properly accounted for. Do not use the `force` flag when deleting inventory levels with non-zero stock.
4. **Inventory Links**: Properly link inventory items to product variants to ensure accurate inventory tracking.
5. **Inventory Adjustments**: Use positive and negative adjustments to add or remove stock rather than directly setting quantities when appropriate.

These workflows provide a comprehensive system for managing inventory in Medusa, allowing you to track stock levels across multiple locations, link inventory to products, and perform various inventory operations.

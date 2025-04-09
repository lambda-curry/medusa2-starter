# Medusa Inventory Management Workflows Guide

Let me provide detailed instructions for each of the inventory management operations you've listed, ensuring we never use force actions as specified.

## Inventory Operations

### 1. Create Inventory Items

Creating inventory items is the first step in setting up your inventory management system. This operation allows you to define new inventory items that can be tracked across locations.

```typescript
import { createInventoryItemsWorkflow } from "@medusajs/core-flows";

// Example: Creating inventory items
const createItems = async () => {
  const workflow = createInventoryItemsWorkflow(container);
  
  const { result } = await workflow.run({
    input: {
      items: [
        {
          sku: "SHIRT-BLUE-M", // Unique SKU for the item
          title: "Blue T-Shirt (M)",
          description: "Medium-sized blue t-shirt",
          // Optional physical attributes
          weight: 200, // in grams
          height: 5, // in cm
          width: 30, // in cm
          length: 40, // in cm
          // Optional location levels to create simultaneously
          location_levels: [
            {
              location_id: "sloc_123", // Stock location ID
              stocked_quantity: 25 // Initial stock quantity
            }
          ]
        }
      ]
    }
  });
  
  return result;
};
```

**Testing:**
```typescript
import { expect } from "chai";

describe("Create Inventory Items", () => {
  it("should create a new inventory item with initial stock", async () => {
    const result = await createItems();
    
    expect(result).to.be.an("array");
    expect(result[0]).to.have.property("id");
    expect(result[0].sku).to.equal("SHIRT-BLUE-M");
    
    // If location levels were created
    if (result[0].location_levels) {
      expect(result[0].location_levels[0].stocked_quantity).to.equal(25);
    }
  });
});
```

### 2. Fetch Inventory Items

Fetching inventory items allows you to retrieve information about your existing inventory.

```typescript
import { InventoryTypes } from "@medusajs/types";

// Example: Fetching inventory items
const fetchInventoryItems = async () => {
  // Assuming you have access to the inventory service
  const inventoryService = container.resolve("inventoryService");
  
  // Fetch all inventory items
  const allItems = await inventoryService.listInventoryItems();
  
  // Fetch with filters
  const filteredItems = await inventoryService.listInventoryItems({
    filters: {
      sku: { $eq: "SHIRT-BLUE-M" }
    }
  });
  
  // Fetch a specific inventory item by ID
  const specificItem = await inventoryService.retrieveInventoryItem("iitem_123");
  
  return {
    allItems,
    filteredItems,
    specificItem
  };
};
```

**Testing:**
```typescript
describe("Fetch Inventory Items", () => {
  it("should fetch inventory items with filters", async () => {
    const { filteredItems } = await fetchInventoryItems();
    
    expect(filteredItems).to.be.an("array");
    expect(filteredItems.length).to.be.greaterThan(0);
    expect(filteredItems[0].sku).to.equal("SHIRT-BLUE-M");
  });
  
  it("should fetch a specific inventory item by ID", async () => {
    const { specificItem } = await fetchInventoryItems();
    
    expect(specificItem).to.be.an("object");
    expect(specificItem.id).to.equal("iitem_123");
  });
});
```

### 3. Update Inventory Levels

Updating inventory levels allows you to modify the quantity of items at specific locations.

```typescript
import { updateInventoryLevelsWorkflow } from "@medusajs/core-flows";

// Example: Updating inventory levels
const updateLevels = async () => {
  const workflow = updateInventoryLevelsWorkflow(container);
  
  const { result } = await workflow.run({
    input: [
      {
        id: "iilev_123", // The ID of the inventory level to update
        inventory_item_id: "iitem_123", // The inventory item ID
        location_id: "sloc_123", // The location ID
        stocked_quantity: 30, // New stocked quantity
        incoming_quantity: 15 // Expected incoming quantity
      }
    ]
  });
  
  return result;
};
```

**Testing:**
```typescript
describe("Update Inventory Levels", () => {
  it("should update inventory levels with new quantities", async () => {
    const result = await updateLevels();
    
    expect(result).to.be.an("array");
    expect(result[0].id).to.equal("iilev_123");
    expect(result[0].stocked_quantity).to.equal(30);
    expect(result[0].incoming_quantity).to.equal(15);
  });
});
```

### 4. Adjust Inventory Levels

Adjusting inventory levels allows you to increase or decrease quantities without directly setting the value.

```typescript
import { adjustInventoryLevelsStep } from "@medusajs/core-flows";

// Example: Adjusting inventory levels
const adjustLevels = async () => {
  const result = await adjustInventoryLevelsStep([
    {
      inventory_item_id: "iitem_123",
      location_id: "sloc_123",
      adjustment: 5 // Add 5 units to stock
    },
    {
      inventory_item_id: "iitem_456",
      location_id: "sloc_456",
      adjustment: -2 // Remove 2 units from stock
    }
  ]);
  
  return result.data;
};
```

**Testing:**
```typescript
describe("Adjust Inventory Levels", () => {
  it("should adjust inventory levels by the specified amounts", async () => {
    // First, get the current levels
    const inventoryService = container.resolve("inventoryService");
    const beforeLevel = await inventoryService.retrieveInventoryLevel("iitem_123", "sloc_123");
    const initialQuantity = beforeLevel.stocked_quantity;
    
    // Perform adjustment
    const result = await adjustLevels();
    
    // Verify the first adjustment (adding 5)
    expect(result[0].inventory_item_id).to.equal("iitem_123");
    expect(result[0].stocked_quantity).to.equal(initialQuantity + 5);
    
    // Verify the second adjustment (removing 2)
    const secondItem = result.find(item => 
      item.inventory_item_id === "iitem_456" && 
      item.location_id === "sloc_456"
    );
    expect(secondItem).to.exist;
  });
});
```

### 5. Validate Inventory Items

Validating inventory items ensures that your inventory data is consistent and accurate.

```typescript
// Example: Validating inventory items
const validateInventoryItems = async (variantId, quantity = 1) => {
  // Assuming you have access to the inventory service
  const inventoryService = container.resolve("inventoryService");
  
  // Check if a variant has enough inventory across all locations
  const validationResult = await inventoryService.validateInventoryAtLocations(
    variantId,
    quantity
  );
  
  // Check inventory at a specific location
  const locationValidation = await inventoryService.validateInventoryAtLocation(
    variantId,
    "sloc_123",
    quantity
  );
  
  return {
    validationResult,
    locationValidation
  };
};
```

**Testing:**
```typescript
describe("Validate Inventory Items", () => {
  it("should validate if a variant has sufficient inventory", async () => {
    const { validationResult } = await validateInventoryItems("variant_123", 2);
    
    expect(validationResult).to.be.an("object");
    expect(validationResult.hasInventory).to.be.a("boolean");
    
    if (validationResult.hasInventory) {
      expect(validationResult.availableQuantity).to.be.at.least(2);
    } else {
      expect(validationResult.availableQuantity).to.be.lessThan(2);
    }
  });
  
  it("should validate inventory at a specific location", async () => {
    const { locationValidation } = await validateInventoryItems("variant_123", 1);
    
    expect(locationValidation).to.be.an("object");
    expect(locationValidation.hasInventory).to.be.a("boolean");
  });
});
```

## Additional Useful Operations

### Creating Inventory Levels for Existing Items

```typescript
import { createInventoryLevelsWorkflow } from "@medusajs/core-flows";

const createLevels = async () => {
  const workflow = createInventoryLevelsWorkflow(container);
  
  const { result } = await workflow.run({
    input: [
      {
        inventory_item_id: "iitem_123",
        location_id: "sloc_789", // A new location for this item
        stocked_quantity: 15
      }
    ]
  });
  
  return result;
};
```

### Attaching Inventory Items to Product Variants

```typescript
import { createLinksWorkflow } from "@medusajs/core-flows";
import { Modules } from "@medusajs/framework/utils";

const attachInventoryToVariant = async () => {
  const workflow = createLinksWorkflow(container);
  
  const { result } = await workflow.run({
    input: [
      {
        [Modules.PRODUCT]: { variant_id: "variant_123" },
        [Modules.INVENTORY]: { inventory_item_id: "iitem_123" },
        data: { required_quantity: 1 } // How many of this item are needed per variant
      }
    ]
  });
  
  return result;
};
```

### Batch Managing Inventory Levels

```typescript
import { batchInventoryItemLevelsWorkflow } from "@medusajs/core-flows";

const batchManageLevels = async () => {
  const workflow = batchInventoryItemLevelsWorkflow(container);
  
  const { result } = await workflow.run({
    input: {
      create: [
        {
          inventory_item_id: "iitem_123",
          location_id: "sloc_456",
          stocked_quantity: 10
        }
      ],
      update: [
        {
          id: "iilev_789",
          inventory_item_id: "iitem_789",
          location_id: "sloc_789",
          stocked_quantity: 25
        }
      ],
      delete: [], // We're not using delete as per your requirement to avoid force actions
      force: false // Explicitly set to false to ensure we never force delete
    }
  });
  
  return result;
};
```

## Best Practices

1. **Always validate inventory before operations**: Check if there's enough inventory before allowing checkout or fulfillment.

2. **Use adjustments for incremental changes**: When receiving new stock or fulfilling orders, use adjustments rather than direct updates.

3. **Batch operations for efficiency**: Use batch workflows when making multiple changes to improve performance.

4. **Keep inventory and product data in sync**: Ensure that inventory items are properly linked to product variants.

5. **Regular inventory audits**: Implement periodic inventory validation to catch discrepancies.

6. **Handle reservations properly**: Remember that reserved inventory is not available for sale, even though it's still in stock.

7. **Never use force operations**: As per your requirement, avoid using force flags when deleting inventory levels to prevent accidental data loss.

8. **Transaction safety**: Wrap critical inventory operations in transactions to ensure data consistency.

These instructions should provide a comprehensive guide for implementing the inventory management operations you've listed, with testing examples for each operation.

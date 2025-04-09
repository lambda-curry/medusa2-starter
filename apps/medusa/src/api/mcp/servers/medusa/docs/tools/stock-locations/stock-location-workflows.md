# Comprehensive Guide to Stock Location Workflows in Medusa

Stock locations are a fundamental part of Medusa's inventory management system. They represent physical places where your inventory is stored and from which orders can be fulfilled. Let me explain each of the workflows you've listed in detail.

## 1. Create Stock Locations

This workflow allows you to create new stock locations in your Medusa store.

```typescript
import { createStockLocationsWorkflow } from "@medusajs/core-flows";

const createLocations = async () => {
  const workflow = createStockLocationsWorkflow(container);
  
  const { result } = await workflow.run({
    input: {
      locations: [
        {
          name: "Main Warehouse",
          address: {
            address_1: "123 Main Street",
            city: "New York",
            country_code: "US",
            postal_code: "10001",
            province: "NY"
          },
          metadata: {
            has_cold_storage: true,
            warehouse_code: "NYC-MAIN"
          }
        },
        {
          name: "West Coast Distribution Center",
          address: {
            address_1: "456 Tech Blvd",
            city: "San Francisco",
            country_code: "US",
            postal_code: "94105",
            province: "CA"
          }
        }
      ]
    }
  });
  
  return result;
};
```

**Key Features:**
- Create multiple locations in a single operation
- Add detailed address information for each location
- Include custom metadata for additional location attributes
- Locations are immediately available for inventory assignment

**Use Cases:**
- Initial store setup
- Expanding to new warehouses or fulfillment centers
- Setting up dropshipping locations

## 2. Update Stock Locations

This workflow allows you to modify existing stock locations.

```typescript
import { updateStockLocationsWorkflow } from "@medusajs/core-flows";

const updateLocations = async () => {
  const workflow = updateStockLocationsWorkflow(container);
  
  const { result } = await workflow.run({
    input: [
      {
        id: "sloc_123", // The ID of the location to update
        name: "Main Warehouse - Expanded",
        metadata: {
          has_cold_storage: true,
          warehouse_code: "NYC-MAIN",
          square_footage: 25000
        }
      }
    ]
  });
  
  return result;
};
```

**Key Features:**
- Update location names, contact information, and metadata
- Partial updates are supported (only specified fields are changed)
- Updates are reflected immediately in the system

**Use Cases:**
- Renaming locations
- Updating contact information
- Adding or modifying location attributes via metadata
- Changing location status (active/inactive)

## 3. Delete Stock Locations

This workflow allows you to remove stock locations from your system.

```typescript
import { deleteStockLocationsWorkflow } from "@medusajs/core-flows";

const deleteLocations = async () => {
  const workflow = deleteStockLocationsWorkflow(container);
  
  const { result } = await workflow.run({
    input: {
      ids: ["sloc_123", "sloc_456"]
    }
  });
  
  return result;
};
```

**Important Considerations:**
- You cannot delete a location that has active inventory
- You should transfer or remove inventory before deletion
- Deletion is permanent and cannot be undone

**Use Cases:**
- Closing a warehouse
- Removing test or temporary locations
- Consolidating fulfillment operations

## 4. Upsert Stock Location Addresses

This functionality allows you to add or update addresses for stock locations by using the Stock Location Service directly.

```typescript
const upsertAddresses = async () => {
  // Get the stock location service from the container
  const stockLocationService = container.resolve("stockLocationService");
  
  // Format the addresses for the service
  // Note that the service expects address properties at the top level, not nested in an address object
  const addressInputs = [
    {
      location_id: "sloc_123",
      address_1: "123 Main Street",
      address_2: "Suite 500", // Adding a suite number
      city: "New York",
      country_code: "US",
      postal_code: "10001",
      province: "NY",
      phone: "+1 (212) 555-1234" // Adding phone contact
    }
  ];
  
  // Call the service method to upsert the addresses
  const addresses = await stockLocationService.upsertStockLocationAddresses(addressInputs);
  
  return addresses;
};
```

**Key Features:**
- Create new addresses or update existing ones
- Full address details including optional fields
- Multiple addresses can be managed in a single operation
- Address properties are at the top level, not nested in an address object

**Use Cases:**
- Adding detailed shipping information to locations
- Updating address information after a move
- Adding contact information to existing addresses

## 5. Link Sales Channels To Stock Location

This workflow creates associations between sales channels and stock locations, determining which locations fulfill orders from specific sales channels.

```typescript
import { linkSalesChannelsToStockLocationWorkflow } from "@medusajs/core-flows";
import { Modules } from "@medusajs/framework/utils";

const linkSalesChannels = async () => {
  const workflow = linkSalesChannelsToStockLocationWorkflow(container);
  
  const { result } = await workflow.run({
    input: [
      {
        [Modules.STOCK_LOCATION]: { location_id: "sloc_123" },
        [Modules.SALES_CHANNEL]: { sales_channel_id: "sc_123" }
      },
      {
        [Modules.STOCK_LOCATION]: { location_id: "sloc_123" },
        [Modules.SALES_CHANNEL]: { sales_channel_id: "sc_456" }
      }
    ]
  });
  
  return result;
};
```

**Key Features:**
- Create many-to-many relationships between locations and sales channels
- A location can serve multiple sales channels
- A sales channel can be fulfilled from multiple locations

**Use Cases:**
- Setting up region-specific fulfillment
- Configuring channel-specific inventory allocation
- Implementing marketplace-specific fulfillment rules

## 6. Create Location Fulfillment Set

This workflow creates a fulfillment set, which is a group of locations that can be used for fulfillment.

```typescript
import { createLocationFulfillmentSetWorkflow } from "@medusajs/core-flows";

const createFulfillmentSet = async () => {
  const workflow = createLocationFulfillmentSetWorkflow(container);
  
  const { result } = await workflow.run({
    input: {
      name: "East Coast Fulfillment",
      description: "Locations serving the eastern United States",
      location_ids: ["sloc_123", "sloc_456", "sloc_789"]
    }
  });
  
  return result;
};
```

**Key Features:**
- Group multiple locations into a logical set
- Provide a name and description for the set
- Use sets for region-based fulfillment strategies

**Use Cases:**
- Creating regional fulfillment groups
- Setting up primary/backup fulfillment locations
- Organizing locations by fulfillment capability

## 7. Associate Locations With Fulfillment Sets

This workflow allows you to add or remove locations from existing fulfillment sets.

```typescript
import { associateLocationsWithFulfillmentSetsWorkflow } from "@medusajs/core-flows";

const associateLocations = async () => {
  const workflow = associateLocationsWithFulfillmentSetsWorkflow(container);
  
  const { result } = await workflow.run({
    input: {
      // Add locations to sets
      create: [
        {
          fulfillment_set_id: "fs_123",
          location_id: "sloc_123"
        },
        {
          fulfillment_set_id: "fs_123",
          location_id: "sloc_456"
        }
      ],
      // Remove locations from sets
      delete: [
        {
          fulfillment_set_id: "fs_789",
          location_id: "sloc_123"
        }
      ]
    }
  });
  
  return result;
};
```

**Key Features:**
- Add locations to fulfillment sets
- Remove locations from fulfillment sets
- Manage multiple associations in a single operation

**Use Cases:**
- Reorganizing fulfillment strategy
- Adding new locations to existing fulfillment groups
- Removing locations from fulfillment groups when they're no longer needed

## Advanced Usage and Integration

### Combining Stock Location and Inventory Workflows

Stock locations and inventory management are closely integrated. Here's how you might use them together:

```typescript
import { 
  createStockLocationsWorkflow,
  createInventoryItemsWorkflow,
  createInventoryLevelsWorkflow
} from "@medusajs/core-flows";

const setupInventoryWithLocations = async () => {
  // 1. Create stock locations
  const locationsWorkflow = createStockLocationsWorkflow(container);
  const { result: locations } = await locationsWorkflow.run({
    input: {
      locations: [
        {
          name: "Main Warehouse",
          address: {
            address_1: "123 Main Street",
            city: "New York",
            country_code: "US",
            postal_code: "10001"
          }
        }
      ]
    }
  });
  
  // 2. Create inventory items
  const itemsWorkflow = createInventoryItemsWorkflow(container);
  const { result: items } = await itemsWorkflow.run({
    input: {
      items: [
        {
          sku: "TSHIRT-BLUE-M",
          title: "Blue T-Shirt (M)"
        }
      ]
    }
  });
  
  // 3. Create inventory levels (associate items with locations)
  const levelsWorkflow = createInventoryLevelsWorkflow(container);
  const { result: levels } = await levelsWorkflow.run({
    input: [
      {
        inventory_item_id: items[0].id,
        location_id: locations[0].id,
        stocked_quantity: 100
      }
    ]
  });
  
  return {
    locations,
    items,
    levels
  };
};
```

### Setting Up Location-Based Fulfillment Strategy

```typescript
import { 
  createStockLocationsWorkflow,
  createLocationFulfillmentSetWorkflow,
  linkSalesChannelsToStockLocationWorkflow
} from "@medusajs/core-flows";
import { Modules } from "@medusajs/framework/utils";

const setupRegionalFulfillment = async () => {
  // 1. Create stock locations for different regions
  const locationsWorkflow = createStockLocationsWorkflow(container);
  const { result: locations } = await locationsWorkflow.run({
    input: {
      locations: [
        {
          name: "East Coast Warehouse",
          address: {
            address_1: "123 East St",
            city: "New York",
            country_code: "US",
            postal_code: "10001"
          }
        },
        {
          name: "West Coast Warehouse",
          address: {
            address_1: "456 West Blvd",
            city: "Los Angeles",
            country_code: "US",
            postal_code: "90001"
          }
        }
      ]
    }
  });
  
  // 2. Create fulfillment sets for each region
  const eastCoastSetWorkflow = createLocationFulfillmentSetWorkflow(container);
  const { result: eastCoastSet } = await eastCoastSetWorkflow.run({
    input: {
      name: "East Coast Fulfillment",
      location_ids: [locations[0].id]
    }
  });
  
  const westCoastSetWorkflow = createLocationFulfillmentSetWorkflow(container);
  const { result: westCoastSet } = await westCoastSetWorkflow.run({
    input: {
      name: "West Coast Fulfillment",
      location_ids: [locations[1].id]
    }
  });
  
  // 3. Link sales channels to appropriate locations
  const linkWorkflow = linkSalesChannelsToStockLocationWorkflow(container);
  const { result: links } = await linkWorkflow.run({
    input: [
      {
        [Modules.STOCK_LOCATION]: { location_id: locations[0].id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: "sc_east" }
      },
      {
        [Modules.STOCK_LOCATION]: { location_id: locations[1].id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: "sc_west" }
      }
    ]
  });
  
  return {
    locations,
    eastCoastSet,
    westCoastSet,
    links
  };
};
```

## Best Practices for Stock Location Management

1. **Plan Your Location Structure**
   - Consider your physical warehouses, dropshipping locations, and retail stores
   - Design a location hierarchy that matches your business operations

2. **Use Meaningful Names and Metadata**
   - Give locations clear, descriptive names
   - Use metadata to store additional attributes like warehouse size, capabilities, etc.

3. **Keep Address Information Complete**
   - Include all address fields for accurate shipping calculations
   - Add contact information for each location

4. **Organize Locations with Fulfillment Sets**
   - Group locations by region, capability, or priority
   - Use fulfillment sets for more sophisticated fulfillment strategies

5. **Link Sales Channels Strategically**
   - Consider which locations should fulfill orders from each sales channel
   - Use proximity and inventory availability as factors

6. **Maintain Location Data**
   - Regularly update location information
   - Remove unused locations to keep your system clean

7. **Consider Inventory Transfer Workflows**
   - Implement processes for transferring inventory between locations
   - Track inventory in transit between locations

8. **Set Default Locations**
   - Designate primary fulfillment locations for each region
   - Configure fallback locations for when primary locations can't fulfill orders

## Testing Stock Location Workflows (examples)

Here's a comprehensive test suite for stock location workflows:

```typescript
import { expect } from "chai";
import { 
  createStockLocationsWorkflow,
  updateStockLocationsWorkflow,
  createLocationFulfillmentSetWorkflow,
  associateLocationsWithFulfillmentSetsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  deleteStockLocationsWorkflow
} from "@medusajs/core-flows";
import { upsertStockLocationAddressesStep } from "@medusajs/core-flows/dist/stock-location/steps/upsert-stock-location-addresses";

describe("Stock Location Workflows", () => {
  let testLocation;
  let testFulfillmentSet;
  
  it("should create a stock location", async () => {
    const workflow = createStockLocationsWorkflow(container);
    
    const { result } = await workflow.run({
      input: {
        locations: [{
          name: "Test Warehouse",
          address: {
            address_1: "123 Test St",
            city: "Test City",
            country_code: "US",
            postal_code: "12345"
          }
        }]
      }
    });
    
    expect(result).to.be.an("array");
    expect(result[0]).to.have.property("id");
    expect(result[0].name).to.equal("Test Warehouse");
    
    testLocation = result[0];
  });
  
  it("should update a stock location", async () => {
    const workflow = updateStockLocationsWorkflow(container);
    
    const { result } = await workflow.run({
      input: [{
        id: testLocation.id,
        name: "Updated Test Warehouse",
        metadata: {
          is_test: true
        }
      }]
    });
    
    expect(result).to.be.an("array");
    expect(result[0].name).to.equal("Updated Test Warehouse");
    expect(result[0].metadata.is_test).to.equal(true);
  });
  
  it("should upsert stock location address", async () => {
    // Use the stock location service directly
    const stockLocationService = container.resolve("stockLocationService");
    
    // Format the address input
    const addressInput = {
      location_id: testLocation.id,
      // Address properties at the top level, not nested
      address_1: "123 Test St",
      address_2: "Suite 100",
      city: "Test City",
      country_code: "US",
      postal_code: "12345",
      phone: "555-1234"
    };
    
    // Call the service method
    const result = await stockLocationService.upsertStockLocationAddresses([addressInput]);
    
    expect(result).to.be.an("array");
    expect(result[0].address_2).to.equal("Suite 100");
    expect(result[0].phone).to.equal("555-1234");
  });
  
  it("should create a fulfillment set", async () => {
    const workflow = createLocationFulfillmentSetWorkflow(container);
    
    const { result } = await workflow.run({
      input: {
        name: "Test Fulfillment Set",
        description: "For testing purposes",
        location_ids: [testLocation.id]
      }
    });
    
    expect(result).to.have.property("id");
    expect(result.name).to.equal("Test Fulfillment Set");
    expect(result.locations).to.be.an("array");
    expect(result.locations[0].id).to.equal(testLocation.id);
    
    testFulfillmentSet = result;
  });
  
  it("should associate locations with fulfillment sets", async () => {
    // First create another location
    const locWorkflow = createStockLocationsWorkflow(container);
    const { result: newLocation } = await locWorkflow.run({
      input: {
        locations: [{
          name: "Second Test Location",
          address: {
            address_1: "456 Test Ave",
            city: "Test City",
            country_code: "US",
            postal_code: "12345"
          }
        }]
      }
    });
    
    // Now associate it with the fulfillment set
    const workflow = associateLocationsWithFulfillmentSetsWorkflow(container);
    
    const { result } = await workflow.run({
      input: {
        create: [{
          fulfillment_set_id: testFulfillmentSet.id,
          location_id: newLocation[0].id
        }]
      }
    });
    
    expect(result.created).to.be.an("array");
    expect(result.created.length).to.equal(1);
    
    // Verify the association by retrieving the fulfillment set
    const fulfillmentSetService = container.resolve("fulfillmentSetService");
    const updatedSet = await fulfillmentSetService.retrieve(testFulfillmentSet.id, {
      relations: ["locations"]
    });
    
    expect(updatedSet.locations.length).to.equal(2);
  });
  
  it("should link sales channels to stock location", async () => {
    // First create a sales channel
    const salesChannelService = container.resolve("salesChannelService");
    const salesChannel = await salesChannelService.create({
      name: "Test Sales Channel"
    });
    
    // Now link it to the location
    const workflow = linkSalesChannelsToStockLocationWorkflow(container);
    
    const { result } = await workflow.run({
      input: [{
        [Modules.STOCK_LOCATION]: { location_id: testLocation.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id }
      }]
    });
    
    expect(result).to.be.an("array");
    expect(result.length).to.equal(1);
    
    // Verify the link
    const stockLocationService = container.resolve("stockLocationService");
    const location = await stockLocationService.retrieve(testLocation.id, {
      relations: ["sales_channels"]
    });
    
    expect(location.sales_channels).to.be.an("array");
    expect(location.sales_channels.length).to.equal(1);
    expect(location.sales_channels[0].id).to.equal(salesChannel.id);
  });
  
  // Clean up at the end
  after(async () => {
    // Delete the fulfillment set first
    const fulfillmentSetService = container.resolve("fulfillmentSetService");
    await fulfillmentSetService.delete(testFulfillmentSet.id);
    
    // Then delete the locations
    const workflow = deleteStockLocationsWorkflow(container);
    await workflow.run({
      input: {
        ids: [testLocation.id]
      }
    });
  });
});
```

## Conclusion

Stock location management in Medusa provides a flexible foundation for complex inventory and fulfillment strategies. By effectively using these workflows, you can:

1. Create and manage multiple physical locations
2. Organize locations into logical fulfillment sets
3. Link locations to specific sales channels
4. Implement region-specific fulfillment strategies
5. Support multi-warehouse inventory management

These capabilities allow you to build sophisticated e-commerce operations that can scale with your business and adapt to changing fulfillment needs.

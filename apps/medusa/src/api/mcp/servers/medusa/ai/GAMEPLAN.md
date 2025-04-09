# MCP Product Tools Implementation Gameplan

## Project Structure
```
apps/medusa/src/api/mcp/
├── servers/medusa/
│   ├── tools/
│   │   ├── products/        # Product-related tools
│   │   ├── categories/      # Category management tools
│   │   ├── shipping/        # Shipping profile tools
│   │   ├── regions/         # Region management tools
│   │   ├── sales-channel/   # Sales channel tools
│   │   └── inventory/       # Inventory management tools
│   └── docs/
│       └── tools/           # Tool documentation
└── tests/
    └── __tests__/          # Test implementations
        ├── products/       # Product tool tests
        ├── shipping/       # Shipping tool tests
        ├── regions/        # Region tool tests
        ├── sales-channel/  # Sales channel tests
        └── inventory/      # Inventory tool tests
```

## Implementation Progress

### Phase 1: Core Product Structure
#### Taxonomy Setup
- [ ] Product Types Implementation
  - [ ] create-product-types
    - [ ] 🧪 Test
  - [ ] fetch-product-types
    - [ ] 🧪 Test
  - [ ] update-product-types
    - [ ] 🧪 Test
  - [ ] delete-product-types
    - [ ] 🧪 Test

- [x] Product Categories Implementation
  - [x] create-categories
    - [x] 🧪 Test
  - [x] fetch-categories
    - [x] 🧪 Test
  - [x] update-categories
    - [x] 🧪 Test
  - [x] delete-categories
    - [x] 🧪 Test

- [ ] Product Tags Implementation
  - [ ] create-product-tags
    - [ ] 🧪 Test
  - [ ] fetch-product-tags
    - [ ] 🧪 Test
  - [ ] update-product-tags
    - [ ] 🧪 Test
  - [ ] delete-product-tags
    - [ ] 🧪 Test

#### Basic Product Management
- [x] Core Product Operations
  - [x] create-products
    - [x] 🧪 Test
  - [x] fetch-products
    - [x] 🧪 Test
  - [x] update-products
    - [x] 🧪 Test
  - [x] delete-products
    - [x] 🧪 Test (covered in other tests)

- [ ] Product Options
  - [ ] create-product-options
    - [ ] 🧪 Test
  - [ ] update-product-options
    - [ ] 🧪 Test
  - [ ] delete-product-options
    - [ ] 🧪 Test

### Phase 2: Variant and Inventory Management
#### Product Variants
- [x] Variant Operations
  - [x] create-product-variants
    - [x] 🧪 Test
  - [x] fetch-product-variants
    - [x] 🧪 Test
  - [x] update-product-variants
    - [x] 🧪 Test
  - [x] delete-product-variants
    - [x] 🧪 Test

#### Inventory Management
- [ ] Inventory Operations
  - [x] create-inventory-items
    - [ ] 🧪 Test
  - [x] fetch-inventory-items
    - [ ] 🧪 Test
  - [x] update-inventory-levels
    - [ ] 🧪 Test
  - [x] adjust-inventory-levels
    - [ ] 🧪 Test
  - [x] validate-inventory-items
    - [ ] 🧪 Test
  - [x] attach-inventory-items
    - [ ] 🧪 Test
  - [x] batch-inventory-levels
    - [ ] 🧪 Test
  - [x] delete-inventory-items
    - [ ] 🧪 Test
  - [x] delete-inventory-levels
    - [ ] 🧪 Test
  - [x] update-inventory-items
    - [ ] 🧪 Test

### Phase 3: Pricing and Collections
### Pricing Structure
- [ ] Price Management
  - [ ] create-price-sets
  - [ ] fetch-price-sets
  - [ ] update-price-sets
  - [ ] upsert-variant-prices

- [ ] Price List Operations
  - [ ] create-price-list-prices
  - [ ] update-price-list-prices

### Collections Management
- [ ] Collection Operations
  - [ ] create-product-collections
  - [ ] fetch-product-collections
  - [ ] update-product-collections
  - [ ] delete-product-collections
  - [ ] fetch-collection-products

### Phase 4: Advanced Operations
### Batch Operations
- [ ] Product Batch Operations
  - [ ] batch-product-operations
  - [ ] group-products
  - [ ] batch-update-products
  - [ ] batch-delete-products

- [ ] Variant Batch Operations
  - [ ] batch-product-variants
  - [ ] batch-update-variants
  - [ ] batch-delete-variants

### Relationship Management
- [ ] Product Relationships
  - [ ] batch-link-product-collection
  - [ ] batch-link-product-category

### Import/Export
- [ ] Data Migration
  - [ ] import-products
  - [ ] export-products

### Phase 5: Shipping Profiles
- [x] Shipping Configuration
  - [x] create-shipping-profiles
    - [x] 🧪 Test
  - [x] update-shipping-profiles
    - [x] 🧪 Test
  - [x] delete-shipping-profiles
    - [x] 🧪 Test

### Phase 6: Stock Location Management
- [x] Stock Location Operations
  - [x] `create-stock-locations`
    - [ ] 🧪 Test
  - [x] `update-stock-locations`
    - [ ] 🧪 Test
  - [x] `delete-stock-locations`
    - [ ] 🧪 Test
  - [x] `upsert-stock-location-addresses`
    - [ ] 🧪 Test
  - [x] `fetch-stock-locations`
    - [ ] 🧪 Test

### Future Work (DO NOT DO YET)
  - [ ] link-sales-channels-to-stock-location
    - [ ] 🧪 Test
  - [ ] create-location-fulfillment-set
    - [ ] 🧪 Test
  - [ ] associate-locations-with-fulfillment-sets
    - [ ] 🧪 Test


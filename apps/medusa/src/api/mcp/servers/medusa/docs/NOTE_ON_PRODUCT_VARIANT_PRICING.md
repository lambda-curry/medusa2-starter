# Medusa Pricing with Region Rules Implementation Guide

## Key Implementation Patterns

### 1. Price Creation in Product Variants
When creating products with regional pricing, each variant must include explicit region rules:

```typescript
// From seed products.ts
{
  variants: [
    {
      prices: [
        {
          amount: cad,
          currency_code: 'cad',
          rules: { region_id: ca_region_id }, // Required for price resolution
        },
        {
          amount: usd,
          currency_code: 'usd', 
          rules: { region_id: us_region_id },
        }
      ]
    }
  ]
}
```

### 2. Price Querying Pattern
When fetching prices, the region must be resolved first to get accurate calculated prices:

```typescript
// From fetch-product-variants.ts
const { data: regions = [] } = await graphQuery.graph({
  entity: 'region',
  filters: { currency_code: currencyCode },
});

const context = {
  calculated_price: QueryContext({
    currency_code: currencyCode,
    region_id: regionId, // Resolved from region query
  })
};
```

### 3. Update vs Create Behavior
**Create Operations** require explicit region rules:
```typescript
// Required during product/variant creation
{
  prices: [{
    currency_code: 'usd',
    amount: 1000,
    rules: { region_id: 'reg_123' } // Mandatory
  }]
}
```

**Update Operations** can omit region rules:
```typescript
// When using update-variant tool
{
  prices: [{
    currency_code: 'usd',
    amount: 1200 // Region rules not required
  }]
}
```

## Implementation Notes

1. **Currency-Region Binding**
- Prices are always stored with currency codes
- Regions map currencies to fulfillment/delivery areas
- Use `region_query` parameter to override default region resolution

2. **Price Calculation Flow**
```
Product Creation → 
  Variant Prices with Region Rules → 
    Region-Currency Mapping → 
      Query Context Setup → 
        Calculated Price Resolution
```

3. **Best Practices**
- Always include region rules when creating new prices
- Use currency codes as primary price identifiers
- Validate region existence before price operations
- Use batch operations for regional price updates

## Common Pitfalls
- ⚠️ **Missing Region Rules** on create operations leads to unqueryable prices
- ⚠️ **Currency-Region Mismatch** causes incorrect price calculations
- ⚠️ **Hardcoded Region IDs** in tests leads to environment-specific failures

## Price Calculation Details

### CalculatedPriceSet Interface
The `CalculatedPriceSet` interface is central to Medusa's price calculation system, providing both calculated and original price information:

```typescript
interface CalculatedPriceSet {
  id: string;
  calculated_amount: BigNumberValue | null;
  original_amount: BigNumberValue | null;
  currency_code: string | null;
  
  // Price List Flags
  is_calculated_price_price_list?: boolean;
  is_calculated_price_tax_inclusive?: boolean;
  is_original_price_price_list?: boolean;
  is_original_price_tax_inclusive?: boolean;

  // Detailed Price Information
  calculated_price?: {
    id: string | null;
    price_list_id: string | null;
    price_list_type: string | null;
    min_quantity: BigNumberValue | null;
    max_quantity: BigNumberValue | null;
  };
  
  original_price?: {
    id: string | null;
    price_list_id: string | null;
    price_list_type: string | null;
    min_quantity: BigNumberValue | null;
    max_quantity: BigNumberValue | null;
  };
}
```

#### Key Behaviors
1. **Price List Resolution**
   - When no valid price list exists, calculated price defaults to original price
   - With override-type price lists, original price matches calculated price
   - `is_calculated_price_price_list` indicates if final price comes from a price list

2. **Price Calculation States**
   - Both calculated and original amounts can be null
   - Currency code may be null if no price is calculated
   - Tax inclusion is tracked separately for both calculated and original prices

3. **Quantity-Based Pricing**
   - Supports tiered pricing through min/max quantity thresholds
   - Both calculated and original prices can have quantity rules
   - Useful for bulk purchase discounts

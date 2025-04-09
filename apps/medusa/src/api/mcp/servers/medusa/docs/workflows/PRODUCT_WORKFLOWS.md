# Product Management Workflows

## Core Product Operations

### Product Lifecycle
- **Create Product Base**  
  Initializes product master record with required metadata.  
  *Fields:* Title, slug, product type, base attributes  
  *Validation:* Unique slug enforcement, SEO-friendly URL generation  
  *Example:* `POST /products { title: "Premium Widget", type: "physical", attributes: { weight: "2.5kg" } }`

- **Create Product Variants**  
  Generates SKU variations with inventory tracking.  
  *Use cases:* Size/color options, regional variants, material differences  
  *Example:* 
  ```typescript
  await createVariants({
    productId: 'prod_01HTXSAY6F2NQ5T0Z7P1K5EJGE',
    options: [
      { size: 'S', color: 'red' },
      { size: 'M', color: 'blue' }
    ],
    inventoryStrategy: 'FIFO'
  });
  ```

### Inventory Management
- **Sync Inventory Levels**  
  Real-time stock synchronization across sales channels.  
  *Integrations:* POS systems, 3PL warehouses, marketplace APIs  
  *Thresholds:* Low stock alerts, backorder triggers

- **Update Inventory Reservations**  
  Atomic operations for cart reservations and order fulfillment.  
  *Concurrency:* Optimistic locking for high-volume transactions  
  *Example:* `PATCH /inventory/reserve { sku: "WIDGET-S-RED", quantity: 2, cartId: "cart_123" }`

## Pricing & Promotions

- **Create Price Set**  
  Configures complex pricing structures.  
  *Strategies:* Tiered pricing, currency conversion, B2B/B2C differentiation  
  *Example:* 
  ```typescript
  createPriceSet({
    basePrice: 99.99,
    rules: [
      { type: 'BULK', minQty: 10, discount: 0.15 },
      { type: 'CUSTOMER_GROUP', groupId: 'VIP', discount: 0.20 }
    ]
  });
  ```

- **Schedule Price Changes**  
  Time-based price adjustments with audit trail.  
  *Use cases:* Seasonal pricing, flash sales, cost-based adjustments  
  *Audit:* Records price history with change justification

## Category Management

- **Attach to Categories**  
  Dynamic taxonomy management with multiple inheritance.  
  *Features:* Automatic breadcrumb generation, SEO meta injection  
  *Example:* `POST /products/categories/attach { productId: "prod_123", categories: ["electronics", "gadgets"] }`

- **Create Product Collection**  
  Curated product groupings with manual/auto population.  
  *Example:* 
  ```typescript
  createCollection({
    type: 'AUTOMATED',
    rules: [
      { field: 'price', operator: 'gte', value: 100 },
      { field: 'tags', contains: 'premium' }
    ]
  });
  ```

## Media Management

- **Process Product Assets**  
  Automated image/video processing pipeline.  
  *Services:* Cloudinary integration, ALT text generation, CDN distribution  
  *Formats:* WebP conversion, responsive image variants

- **Create Digital Assets**  
  Manages downloadable content and license keys.  
  *Security:* Signed URLs, download limits, expiration policies  
  *Example:* `POST /products/assets { type: "digital", url: "s3://bucket/file.pdf", expiryDays: 30 }`

## Publishing Workflows

- **Stage Product Drafts**  
  Version-controlled content staging with collaboration features.  
  *Features:* Change requests, approval workflows, scheduled publishing  
  *States:* Draft, Review, Approved, Published

- **Archive Products**  
  Soft-delete with preservation of historical data.  
  *Compliance:* Maintains order history references for 7 years  
  *Example:* `PATCH /products/archive { id: "prod_123", reason: "EOL", retentionPeriod: "7y" }`


**Best Practices:**
1. Use inventory reservations with cart expiration TTLs
2. Separate variant creation from base product creation
3. Implement price versioning for audit purposes
4. Use collection rules for dynamic merchandising
5. Wrap media processing in circuit breakers
6. Validate product schema before creation
7. Monitor inventory sync latency
8. Cache category trees for faster lookups 
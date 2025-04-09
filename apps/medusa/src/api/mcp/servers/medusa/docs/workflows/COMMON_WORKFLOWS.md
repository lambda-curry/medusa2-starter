# Common Medusa Workflows

## Core Workflow Categories

### Entity Management
- **Create Entities**  
  Initializes new entities in the system with required properties.  
  *Use cases:* User onboarding, product catalog management, content creation  
  *Example:* `POST /entities { type: "product", attributes: { name: "Widget", price: 29.99 } }`

- **Delete Entities**  
  Permanently removes entities from the system with cascading deletions.  
  *Use cases:* GDPR compliance, inventory cleanup, user account termination

### Link Management
- **Create Links**  
  Establishes relationships between entities (1:1, 1:many, many:many).  
  *Example:* Linking users to organizations, products to categories

- **Batch Links**  
  Bulk operation for creating multiple relationships simultaneously.  
  *Optimization:* Reduces API calls by 90% for large datasets

- **Update Links**  
  Modifies existing relationships while maintaining referential integrity.  
  *Use cases:* Role changes, category reassignments

### Remote System Integration
- **Create Remote Links**  
  Connects local entities to external systems (e.g., payment gateways, CRMs).  
  *Security:* Uses OAuth2 for secure third-party authentication

- **Dismiss Remote Links**  
  Temporarily deactivates external connections without deletion.  
  *Compliance:* Meets data residency requirements

- **Remove Remote Links**  
  Permanent deletion of external system connections.  
  *Audit:* Generates deletion confirmation receipts

### Event Handling
- **Emit Event**  
  Triggers event-driven processes with payload encapsulation.  
  *Example:* `order_created`, `payment_processed`

- **Release Event**  
  Finalizes event lifecycle and cleans up related resources.  
  *Guarantees:* Exactly-once delivery semantics

### Query Operations
- **Use Query Graph**  
  Complex relationship traversal with graph-based queries.  
  *Features:* N+1 prevention, depth limiting

- **Use Remote Query**  
  Federated queries across multiple external systems.  
  *Performance:* Parallel execution with timeout handling

### Validation
- **Validate Presence Of**  
  Entity integrity checks before critical operations.  
  *Checks:* Required fields, relationship existence, state validity

---

## Workflow Composition Pattern

Combine workflows using the pipe operator for complex operations:
```typescript
await createEntities(productData)
  |> batchLinks(inventoryRelations)
  |> createRemoteLinks(erpSystemConfig)
  |> emitEvent('inventory_updated');
```

**Best Practices:**
1. Chain maximum 5 workflows for maintainability
2. Use Validate Presence Of as first step in critical chains
3. Wrap remote operations in error boundaries
4. Monitor workflow durations with OpenTelemetry

## Fetch Actions

### Product Fetch Actions

-   **fetch-products**
    - Description: Retrieve products with advanced filtering and pagination

-   **fetch-product-variants**
    - Description: Get variants with inventory and pricing details

### Taxonomy Fetch Actions

-   **fetch-product-categories**
    - Description: Retrieve category hierarchy with filtering

-   **fetch-product-collections**
    - Description: Get collections with product associations

-   **fetch-product-tags**
    - Description: List tags with usage statistics

-   **fetch-product-types**
    - Description: Retrieve registered product types

### Inventory Fetch Actions

-   **fetch-inventory-items**
    - Description: Get inventory data with location tracking

### Pricing Fetch Actions

-   **fetch-price-sets**
    - Description: Retrieve pricing configurations

### Relationship Fetch Actions

-   **fetch-collection-products**
    - Description: List products in a specific collection

-   **fetch-category-products**
    - Description: Get products in a category

## Create, Update, Delete Actions

### Product Actions

-   **create-products**
    - Description: Create new products, including their basic details, options, and initial variants
    - Workflows:
        - Create Products

-   **update-products**
    - Description: Modify existing product details, including core attributes, option configurations, and relationships
    - Workflows:
        - Update Products

-   **delete-products**
    - Description: Remove products from the catalog, including all associated variants, options, and relationships
    - Workflows:
        - Delete Products

-   **batch-product-operations**
    - Description: Perform bulk operations on products, including creating, updating, and deleting multiple products simultaneously
    - Workflows:
        - Batch Products

-   **group-products**
    - Description: Group products together for batch operations
    - Workflows:
        - Group Products For Batch

-   **import-products**
    - Description: Import products from a CSV file, allowing for bulk creation and updates based on the provided data
    - Workflows:
        - Import Products

-   **export-products**
    - Description: Export product data to a CSV file, with options to filter the exported data based on various criteria
    - Workflows:
        - Export Products

### Variant Actions

-   **create-product-variants**
    - Description: Add new variants to existing products, specifying attributes, pricing, and inventory details
    - Workflows:
        - Create Product Variants

-   **update-product-variants**
    - Description: Modify existing variant details, including attributes, pricing, and inventory information
    - Workflows:
        - Update Product Variants

-   **delete-product-variants**
    - Description: Remove variants from products, updating inventory and pricing accordingly
    - Workflows:
        - Delete Product Variants

-   **batch-product-variants**
    - Description: Perform bulk operations on variants, including creating, updating, and deleting multiple variants simultaneously
    - Workflows:
        - Batch Product Variants

-   **upsert-variant-prices**
    - Description: Manage and update the pricing configurations for variants, including different price sets and rules
    - Workflows:
        - Upsert Variant Prices

### Taxonomy Actions

-   **create-product-categories**
    - Description: Create hierarchical product categories, defining parent-child relationships to structure the catalog
    - Workflows:
        - Create Product Categories

-   **update-product-categories**
    - Description: Modify category details, including name, description, and position within the hierarchy
    - Workflows:
        - Update Product Categories

-   **delete-product-categories**
    - Description: Remove categories, handling the reassignment or deletion of associated products and child categories
    - Workflows:
        - Delete Product Categories

-   **create-product-collections**
    - Description: Create product collections, which are groups of products that can be used for various purposes
    - Workflows:
        - Create Collections

-   **update-product-collections**
    - Description: Modify collection details, including name, description, and the products included in the collection
    - Workflows:
        - Update Collections

-   **delete-product-collections**
    - Description: Remove collections, updating any associated products or promotions
    - Workflows:
        - Delete Collections

-   **create-product-tags**
    - Description: Add new tags to the system, which can be used to categorize and filter products
    - Workflows:
        - Create Product Tags

-   **update-product-tags**
    - Description: Modify tag details, including name and description
    - Workflows:
        - Update Product Tags

-   **delete-product-tags**
    - Description: Remove tags from the system, updating any associated products
    - Workflows:
        - Delete Product Tags

-   **create-product-types**
    - Description: Define new product types, which represent different categories or classifications of products
    - Workflows:
        - Create Product Types

-   **update-product-types**
    - Description: Modify product type details, including name and description
    - Workflows:
        - Update Product Types

-   **delete-product-types**
    - Description: Remove product types from the system
    - Workflows:
        - Delete Product Types

### Option Actions

-   **create-product-options**
    - Description: Add new options to products, defining choices that customers can select (e.g., size, color)
    - Workflows:
        - Create Product Options

-   **update-product-options**
    - Description: Modify option details, including name, values, and associated products
    - Workflows:
        - Update Product Options

-   **delete-product-options**
    - Description: Remove options from products, updating any associated variants
    - Workflows:
        - Delete Product Options

### Inventory Actions

-   **create-inventory-items**
    - Description: Create new inventory items for product variants
    - Workflows:
        - Create Inventory Items

-   **update-inventory-levels**
    - Description: Update the inventory levels for existing inventory items
    - Workflows:
        - Update Inventory Levels

-   **adjust-inventory-levels**
    - Description: Make adjustments to inventory levels with tracking
    - Workflows:
        - Adjust Inventory Levels

-   **validate-inventory-items**
    - Description: Validate inventory items and their configurations
    - Workflows:
        - Validate Inventory Items

### Pricing Actions

-   **create-price-sets**
    - Description: Create new price sets for variants
    - Workflows:
        - Create Price Sets

-   **update-price-sets**
    - Description: Update existing price sets
    - Workflows:
        - Update Price Sets

-   **create-price-list-prices**
    - Description: Create new prices in price lists
    - Workflows:
        - Create Price List Prices

-   **update-price-list-prices**
    - Description: Update existing prices in price lists
    - Workflows:
        - Update Price List Prices

### Shipping Profile Actions

-   **create-shipping-profiles**
    - Description: Create new shipping profiles
    - Workflows:
        - Create Shipping Profiles

-   **update-shipping-profiles**
    - Description: Update existing shipping profiles
    - Workflows:
        - Update Shipping Profiles

-   **delete-shipping-profiles**
    - Description: Remove shipping profiles from the system
    - Workflows:
        - Delete Shipping Profiles

### Product Relationship Actions

-   **batch-link-product-collection**
    - Description: Manage the relationships between products and collections in bulk
    - Workflows:
        - Batch Link Products Collection

-   **batch-link-product-category**
    - Description: Manage the relationships between products and categories in bulk
    - Workflows:
        - Batch Link Products In Category

### Batch Operations

-   **batch-update-products**
    - Description: Modify multiple products simultaneously
    - Workflows:
        - Batch Products

-   **batch-update-variants**
    - Description: Modify multiple variants simultaneously
    - Workflows:
        - Batch Product Variants

-   **batch-update-price-list-prices**
    - Description: Modify multiple price list prices simultaneously
    - Workflows:
        - Batch Price List Prices

-   **batch-delete-products**
    - Description: Remove multiple products simultaneously
    - Workflows:
        - Delete Products

-   **batch-delete-variants**
    - Description: Remove multiple variants simultaneously
    - Workflows:
        - Delete Product Variants

-   **batch-delete-collections**
    - Description: Remove multiple collections simultaneously
    - Workflows:
        - Delete Collections


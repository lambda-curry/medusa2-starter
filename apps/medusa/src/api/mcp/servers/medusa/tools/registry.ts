import { fetchProductsTool } from './products/fetch-products';
import { fetchCategoriesTool } from './categories/fetch-categories';
import { createProductsTool } from './products/create-products';
import { deleteProductsTool } from './products/delete-products';
import { fetchProductVariantsTool } from './products/fetch-product-variants';
import { createProductVariantsTool } from './products/create-product-variants';
import { createCategoriesTool } from './categories/create-categories';
import { deleteCategoryTool } from './categories/delete-categories';
import { updateCategoriesTool } from './categories/update-categories';
import { updateProductVariantsTool } from './products/update-product-variants';
import { deleteProductVariantsTool } from './products/delete-product-variants';
import { fetchRegionsTool } from './regions/fetch-regions';
import { createShippingProfilesTool } from './shipping/create-shipping-profiles';
import { fetchShippingProfilesTool } from './shipping/fetch-shipping-profiles';
import { deleteShippingProfilesTool } from './shipping/delete-shipping-profiles';
import { updateShippingProfilesTool } from './shipping/update-shipping-profiles';
import { updateSingleProductTool } from './products/update-single-product';
import { fetchSalesChannelsTool } from './sales-channel/fetch-sales-channels';
// Import inventory tools
import { createInventoryItemsTool } from './inventory/create-inventory-items';
import { fetchInventoryItemsTool } from './inventory/fetch-inventory-items';
import { updateInventoryLevelsTool } from './inventory/update-inventory-levels';
import { adjustInventoryLevelsTool } from './inventory/adjust-inventory-levels';
import { validateInventoryItemsTool } from './inventory/validate-inventory-items';
import { attachInventoryItemsTool } from './inventory/attach-inventory-items';
import { deleteInventoryItemsTool } from './inventory/delete-inventory-items';
import { updateInventoryItemsTool } from './inventory/update-inventory-items';
import { deleteInventoryLevelsTool } from './inventory/delete-inventory-levels';
import { batchInventoryLevelsTool } from './inventory/batch-inventory-levels';

// Import stock location tools
import { createStockLocationsTool } from './stock-locations/create-stock-locations';
import { updateStockLocationsTool } from './stock-locations/update-stock-locations';
import { deleteStockLocationsTool } from './stock-locations/delete-stock-locations';
import { upsertStockLocationAddressesTool } from './stock-locations/TODO (not working yet)/upsert-stock-location-addresses';
import { fetchStockLocationsTool } from './stock-locations/fetch-stock-locations';

export const toolRegistry = {
  // Products
  'fetch-products': fetchProductsTool,
  'update-single-product': updateSingleProductTool,
  'create-products': createProductsTool,
  'delete-products': deleteProductsTool,
  // Product Variants
  'fetch-product-variants': fetchProductVariantsTool,
  'create-product-variants': createProductVariantsTool,
  'update-product-variants': updateProductVariantsTool,
  'delete-product-variants': deleteProductVariantsTool,
  // Categories
  'fetch-categories': fetchCategoriesTool,
  'create-categories': createCategoriesTool,
  'delete-categories': deleteCategoryTool,
  'update-categories': updateCategoriesTool,
  // Regions
  'fetch-regions': fetchRegionsTool,
  // Shipping Profiles
  'create-shipping-profiles': createShippingProfilesTool,
  'fetch-shipping-profiles': fetchShippingProfilesTool,
  'delete-shipping-profiles': deleteShippingProfilesTool,
  'update-shipping-profiles': updateShippingProfilesTool,
  // Sales Channels
  'fetch-sales-channels': fetchSalesChannelsTool,
  // Inventory Management
  'create-inventory-items': createInventoryItemsTool,
  'fetch-inventory-items': fetchInventoryItemsTool,
  'update-inventory-levels': updateInventoryLevelsTool,
  'adjust-inventory-levels': adjustInventoryLevelsTool,
  'validate-inventory-items': validateInventoryItemsTool,
  'attach-inventory-items': attachInventoryItemsTool,
  'delete-inventory-items': deleteInventoryItemsTool,
  'update-inventory-items': updateInventoryItemsTool,
  'delete-inventory-levels': deleteInventoryLevelsTool,
  'batch-inventory-levels': batchInventoryLevelsTool,

  // Stock Locations
  'create-stock-locations': createStockLocationsTool,
  'update-stock-locations': updateStockLocationsTool,
  'delete-stock-locations': deleteStockLocationsTool,
  // TODO: Fix upserting addresses
  // 'upsert-stock-location-addresses': upsertStockLocationAddressesTool,
  'fetch-stock-locations': fetchStockLocationsTool,
} as const;

export type ToolRegistry = typeof toolRegistry;
export type ToolName = keyof ToolRegistry;

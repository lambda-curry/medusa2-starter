import { MedusaContainer } from '@medusajs/types';
import { Modules } from '@medusajs/framework/utils';
import { IInventoryService } from '@medusajs/types';

interface InventoryService {
  retrieveInventoryItem: (id: string) => Promise<any>;
  listInventoryItems: (config: {
    filters?: Record<string, any>;
    take?: number;
    skip?: number;
  }) => Promise<{
    items: any[];
    count: number;
  }>;
  retrieveInventoryLevel: (itemId: string, locationId: string) => Promise<any>;
  createInventoryLevel: (data: {
    inventory_item_id: string;
    location_id: string;
    stocked_quantity?: number;
    incoming_quantity?: number;
  }) => Promise<any>;
  updateInventoryLevel: (
    id: string,
    data: {
      stocked_quantity?: number;
      incoming_quantity?: number;
    },
  ) => Promise<any>;
  validateInventoryAtLocation: (
    variantId: string,
    locationId: string,
    quantity: number,
  ) => Promise<{ hasInventory: boolean; inventoryQuantity: number }>;
  validateInventoryAtLocations: (
    variantId: string,
    quantity: number,
  ) => Promise<{ hasInventory: boolean; inventoryQuantity: number; locationInventory: any[] }>;
}

/**
 * Safely resolves the inventory service from the Medusa container
 */
export const getInventoryService = (container: MedusaContainer): IInventoryService => {
  const inventoryService = container.resolve(Modules.INVENTORY) as IInventoryService;

  if (!inventoryService) {
    throw new Error('Inventory service not found in container');
  }

  return inventoryService;
};

/**
 * Formats the response for inventory items to ensure consistent output
 */
export const formatInventoryItemResponse = (item: any) => {
  if (!item) return null;

  return {
    id: item.id,
    sku: item.sku,
    title: item.title,
    description: item.description,
    height: item.height,
    width: item.width,
    length: item.length,
    weight: item.weight,
    origin_country: item.origin_country,
    metadata: item.metadata || {},
    location_levels: item.location_levels?.map(formatInventoryLevelResponse) || [],
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

/**
 * Formats the response for inventory levels to ensure consistent output
 */
export const formatInventoryLevelResponse = (level: any) => {
  if (!level) return null;

  return {
    id: level.id,
    inventory_item_id: level.inventory_item_id,
    location_id: level.location_id,
    stocked_quantity: level.stocked_quantity || 0,
    reserved_quantity: level.reserved_quantity || 0,
    incoming_quantity: level.incoming_quantity || 0,
    available_quantity: (level.stocked_quantity || 0) - (level.reserved_quantity || 0),
    created_at: level.created_at,
    updated_at: level.updated_at,
  };
};

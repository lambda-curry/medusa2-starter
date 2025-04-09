import { z } from 'zod';

// Base schemas for inventory items
export const inventoryItemBaseSchema = z.object({
  sku: z.string().describe('Unique SKU for the inventory item'),
  title: z.string().optional().describe('Title of the inventory item'),
  description: z.string().optional().describe('Description of the inventory item'),
  weight: z.number().optional().describe('Weight of the item in grams'),
  height: z.number().optional().describe('Height of the item in cm'),
  width: z.number().optional().describe('Width of the item in cm'),
  length: z.number().optional().describe('Length of the item in cm'),
  origin_country: z.string().optional().describe('Country of origin for the item'),
  metadata: z.record(z.any()).optional().describe('Additional metadata for the inventory item'),
});

// Schema for inventory levels
export const inventoryLevelSchema = z.object({
  id: z.string().optional().describe('ID of the inventory level to update (if known)'),
  inventory_item_id: z.string().describe('ID of the inventory item'),
  location_id: z.string().describe('ID of the stock location'),
  stocked_quantity: z.number().optional().describe('Stocked quantity at this location'),
  incoming_quantity: z.number().optional().describe('Expected incoming quantity at this location'),
});

// Schema for inventory level adjustments
export const inventoryAdjustmentSchema = z.object({
  inventory_item_id: z.string().describe('ID of the inventory item'),
  location_id: z.string().describe('ID of the stock location'),
  adjustment: z.number().describe('Quantity to adjust (positive to add, negative to remove)'),
});

// Schema for attaching inventory items to product variants
export const inventoryAttachmentSchema = z.object({
  variant_id: z.string().describe('ID of the product variant'),
  inventory_item_id: z.string().describe('ID of the inventory item to attach'),
  required_quantity: z.number().default(1).describe('How many units of this item are needed per variant'),
});

// Schema for batch inventory level operations
export const batchInventoryLevelCreateSchema = z.object({
  inventory_item_id: z.string().describe('ID of the inventory item'),
  location_id: z.string().describe('ID of the stock location'),
  stocked_quantity: z.number().optional().describe('Initial stocked quantity'),
  incoming_quantity: z.number().optional().describe('Initial incoming quantity'),
});

export const batchInventoryLevelUpdateSchema = z.object({
  id: z.string().describe('ID of the inventory level to update'),
  inventory_item_id: z.string().describe('ID of the inventory item'),
  location_id: z.string().describe('ID of the stock location'),
  stocked_quantity: z.number().optional().describe('Updated stocked quantity'),
  incoming_quantity: z.number().optional().describe('Updated incoming quantity'),
});

export const batchInventoryLevelOperationsSchema = z.object({
  create: z.array(batchInventoryLevelCreateSchema).optional().describe('Inventory levels to create'),
  update: z.array(batchInventoryLevelUpdateSchema).optional().describe('Inventory levels to update'),
  delete: z.array(z.string()).optional().describe('IDs of inventory levels to delete'),
});

// Schema for location levels when creating inventory items
export const locationLevelSchema = z.object({
  location_id: z.string().describe('ID of the stock location'),
  stocked_quantity: z.number().optional().describe('Initial stocked quantity at this location'),
  incoming_quantity: z.number().optional().describe('Expected incoming quantity at this location'),
});

// Complete inventory item schema with location levels
export const inventoryItemSchema = inventoryItemBaseSchema.extend({
  location_levels: z.array(locationLevelSchema).optional().describe('Initial inventory levels at specific locations'),
});

// Types
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type InventoryLevel = z.infer<typeof inventoryLevelSchema>;
export type InventoryAdjustment = z.infer<typeof inventoryAdjustmentSchema>;
export type InventoryAttachment = z.infer<typeof inventoryAttachmentSchema>;
export type LocationLevel = z.infer<typeof locationLevelSchema>;
export type BatchInventoryLevelOperations = z.infer<typeof batchInventoryLevelOperationsSchema>;
export type BatchInventoryLevelCreate = z.infer<typeof batchInventoryLevelCreateSchema>;
export type BatchInventoryLevelUpdate = z.infer<typeof batchInventoryLevelUpdateSchema>;

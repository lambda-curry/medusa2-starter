import { z } from 'zod';

// Address schema for stock locations
export const addressSchema = z.object({
  address_1: z.string().describe('First line of the address'),
  address_2: z.string().optional().describe('Second line of the address'),
  city: z.string().describe('City'),
  country_code: z.string().describe('Country code (e.g., "US", "CA")'),
  postal_code: z.string().describe('Postal/ZIP code'),
  province: z.string().optional().describe('Province/State'),
  phone: z.string().optional().describe('Contact phone number'),
});

// Base stock location schema
export const stockLocationInputSchema = z.object({
  name: z.string().min(1).describe('Name of the stock location'),
  address: addressSchema.optional().describe('Address of the stock location'),
  metadata: z.record(z.any()).optional().describe('Additional fields for the stock location'),
});

// Create stock locations schema
export const createStockLocationsSchema = z.object({
  locations: z.array(stockLocationInputSchema).min(1).describe('List of stock locations to create'),
});

// Update stock locations schema
export const updateStockLocationSchema = z.object({
  id: z.string().describe('ID of the stock location to update'),
  name: z.string().optional().describe('Updated name of the stock location'),
  metadata: z.record(z.any()).optional().describe('Updated metadata for the stock location'),
});

export const updateStockLocationsSchema = z.object({
  locations: z.array(updateStockLocationSchema).min(1).describe('List of stock locations to update'),
});

// Delete stock locations schema
export const deleteStockLocationsSchema = z.object({
  ids: z.array(z.string()).min(1).describe('IDs of the stock locations to delete'),
});

// Upsert stock location addresses schema
export const upsertAddressSchema = z.object({
  location_id: z.string().describe('ID of the stock location'),
  address: addressSchema.describe('Address to upsert for the stock location'),
});

export const upsertStockLocationAddressesSchema = z.object({
  addresses: z.array(upsertAddressSchema).min(1).describe('List of addresses to upsert'),
});

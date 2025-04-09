import type { StockLocationDTO, AddressDTO } from '@medusajs/types';

export interface StockLocationAddress extends Omit<AddressDTO, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {
  id?: string;
}

export type TestStockLocation = {
  name: string;
  address?: StockLocationAddress;
  metadata?: Record<string, unknown>;
};

export interface CreateStockLocationsResponse {
  stock_locations: Array<{
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, unknown>;
    address?: StockLocationAddress;
  }>;
  message: string;
  created_stock_location_ids: string[];
}

export interface DeleteStockLocationsResponse {
  message: string;
  deleted_stock_location_ids: string[];
}

export interface FetchStockLocationsResponse {
  stock_locations: Array<{
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, unknown>;
    address?: StockLocationAddress;
  }>;
  count: number;
  pagination?: {
    offset: number;
    limit: number;
    total: number;
  };
  message?: string;
}

export interface UpdateStockLocationsResponse {
  stock_locations: Array<{
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, unknown>;
  }>;
  message: string;
  updated_stock_location_ids: string[];
}

export interface UpsertStockLocationAddressesResponse {
  addresses?: Array<StockLocationAddress & { location_id: string }>;
  message: string;
  error?: boolean;
  details?: Record<string, any>;
  failedArguments?: Record<string, any>;
}

export function isCreateStockLocationsResponse(obj: unknown): obj is CreateStockLocationsResponse {
  if (typeof obj !== 'object' || !obj) return false;
  const response = obj as Record<string, unknown>;
  return (
    Array.isArray(response.stock_locations) &&
    typeof response.message === 'string' &&
    Array.isArray(response.created_stock_location_ids)
  );
}

export function isDeleteStockLocationsResponse(obj: unknown): obj is DeleteStockLocationsResponse {
  if (typeof obj !== 'object' || !obj) return false;
  const response = obj as Record<string, unknown>;
  return typeof response.message === 'string' && Array.isArray(response.deleted_stock_location_ids);
}

export function isFetchStockLocationsResponse(obj: unknown): obj is FetchStockLocationsResponse {
  if (typeof obj !== 'object' || !obj) return false;
  const response = obj as Record<string, unknown>;
  return Array.isArray(response.stock_locations) && typeof response.count === 'number';
}

export function isUpdateStockLocationsResponse(obj: unknown): obj is UpdateStockLocationsResponse {
  if (typeof obj !== 'object' || !obj) return false;
  const response = obj as Record<string, unknown>;
  return (
    Array.isArray(response.stock_locations) &&
    typeof response.message === 'string' &&
    Array.isArray(response.updated_stock_location_ids)
  );
}

export function isUpsertStockLocationAddressesResponse(obj: unknown): obj is UpsertStockLocationAddressesResponse {
  if (typeof obj !== 'object' || !obj) return false;
  const response = obj as Record<string, unknown>;

  // Check if it's an error response
  if (typeof response.error === 'boolean' && response.error === true && typeof response.message === 'string') {
    return true;
  }

  // Check if it's a success response
  return Array.isArray(response.addresses) && typeof response.message === 'string';
}

interface CreateStockLocationOptions {
  name?: string;
  withAddress?: boolean;
}

export const createTestStockLocation = (
  overrides: Partial<TestStockLocation> = {},
  options: CreateStockLocationOptions = {},
): TestStockLocation => {
  const location: TestStockLocation = {
    name: options.name || `Test Stock Location ${Date.now()}`,
    ...overrides,
  };

  if (options.withAddress) {
    location.address = {
      address_1: '123 Test Street',
      city: 'Test City',
      country_code: 'US',
      postal_code: '12345',
      ...(overrides.address || {}),
    };
  }

  return location;
};

export const createTestStockLocations = (count = 1, withAddress = false): TestStockLocation[] =>
  Array.from({ length: count }).map((_, i) =>
    createTestStockLocation(
      {},
      {
        name: `Test Stock Location ${Date.now()}-${i + 1}`,
        withAddress,
      },
    ),
  );

export const createTestAddress = (locationId: string, overrides: Partial<TestStockLocation['address']> = {}) => ({
  location_id: locationId,
  address: {
    address_1: '123 Test Street',
    city: 'Test City',
    country_code: 'US',
    postal_code: '12345',
    ...overrides,
  },
});

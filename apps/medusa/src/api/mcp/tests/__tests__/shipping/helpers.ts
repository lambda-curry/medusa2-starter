import type { ShippingProfileDTO } from '@medusajs/types';

export type TestShippingProfile = Pick<ShippingProfileDTO, 'name' | 'type'>;

export interface CreateShippingProfilesResponse {
  shipping_profiles: Array<{
    id: string;
    name: string;
    type: string;
    created_at: string;
    metadata?: Record<string, unknown>;
  }>;
  message: string;
  created_shipping_profile_ids: string[];
}

export interface DeleteShippingProfilesResponse {
  message: string;
  deleted_shipping_profile_ids: string[];
}

export interface FetchShippingProfilesResponse {
  shipping_profiles: Array<{
    id: string;
    name: string;
    type: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, unknown>;
  }>;
  count: number;
  pagination?: {
    offset: number;
    limit: number;
    total: number;
  };
}

export function isCreateShippingProfilesResponse(obj: unknown): obj is CreateShippingProfilesResponse {
  if (typeof obj !== 'object' || !obj) return false;
  const response = obj as Record<string, unknown>;
  return (
    Array.isArray(response.shipping_profiles) &&
    typeof response.message === 'string' &&
    Array.isArray(response.created_shipping_profile_ids)
  );
}

export function isDeleteShippingProfilesResponse(obj: unknown): obj is DeleteShippingProfilesResponse {
  if (typeof obj !== 'object' || !obj) return false;
  const response = obj as Record<string, unknown>;
  return typeof response.message === 'string' && Array.isArray(response.deleted_shipping_profile_ids);
}

export function isFetchShippingProfilesResponse(obj: unknown): obj is FetchShippingProfilesResponse {
  if (typeof obj !== 'object' || !obj) return false;
  const response = obj as Record<string, unknown>;
  return Array.isArray(response.shipping_profiles) && typeof response.count === 'number';
}

interface CreateShippingProfileOptions {
  name?: string;
  type?: 'default' | 'gift_card' | 'custom';
}

export const createTestShippingProfile = (
  overrides: Partial<TestShippingProfile> = {},
  options: CreateShippingProfileOptions = {},
): TestShippingProfile => ({
  name: options.name || `Test Shipping Profile ${Date.now()}`,
  type: options.type || 'default',
  ...overrides,
});

export const createTestShippingProfiles = (count = 1): TestShippingProfile[] =>
  Array.from({ length: count }).map((_, i) =>
    createTestShippingProfile(
      {},
      {
        name: `Test Shipping Profile ${i + 1}`,
        type: i === 0 ? 'default' : i === 1 ? 'gift_card' : 'custom',
      },
    ),
  );

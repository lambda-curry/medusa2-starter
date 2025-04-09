import type { Result } from '@modelcontextprotocol/sdk/types.js';
import { useTestClient } from '../../setup';
import { createTestStockLocation, isCreateStockLocationsResponse, isDeleteStockLocationsResponse } from './helpers';

describe('create-stock-locations tool', () => {
  const { connectTestClient, getClient } = useTestClient();
  let client: ReturnType<typeof getClient>;
  let createdLocationIds: string[] = [];

  beforeAll(async () => {
    client = getClient();
    await connectTestClient();
  });

  afterAll(async () => {
    if (createdLocationIds.length > 0) {
      await connectTestClient();
      // Cleanup test data
      const deleteResult = (await client.callTool({
        name: 'delete-stock-locations',
        arguments: {
          ids: createdLocationIds,
        },
      })) as Result & { content: Array<{ text: string }> };

      const deleteContent = JSON.parse(deleteResult.content[0].text);
      expect(isDeleteStockLocationsResponse(deleteContent)).toBe(true);
      expect(deleteContent.deleted_stock_location_ids).toEqual(createdLocationIds);
    }
  });

  describe('successful creation', () => {
    it('should create a single stock location without address', async () => {
      await connectTestClient();
      const location = createTestStockLocation({}, { withAddress: false });

      const result = (await client.callTool({
        name: 'create-stock-locations',
        arguments: {
          locations: [location],
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      if (!isCreateStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations).toHaveLength(1);
      expect(parsedContent.stock_locations[0].name).toBe(location.name);
      expect(parsedContent.created_stock_location_ids).toHaveLength(1);

      // Store created IDs for cleanup
      createdLocationIds.push(...parsedContent.created_stock_location_ids);
    });

    it('should create a single stock location with address', async () => {
      await connectTestClient();
      const location = createTestStockLocation({}, { withAddress: true });

      const result = (await client.callTool({
        name: 'create-stock-locations',
        arguments: {
          locations: [location],
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      if (!isCreateStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations).toHaveLength(1);
      expect(parsedContent.stock_locations[0].name).toBe(location.name);
      expect(parsedContent.stock_locations[0].address).toBeDefined();
      expect(parsedContent.stock_locations[0].address?.address_1).toBe(location.address?.address_1);
      expect(parsedContent.stock_locations[0].address?.city).toBe(location.address?.city);
      expect(parsedContent.stock_locations[0].address?.country_code).toBe(location.address?.country_code);
      expect(parsedContent.stock_locations[0].address?.postal_code).toBe(location.address?.postal_code);
      expect(parsedContent.created_stock_location_ids).toHaveLength(1);

      // Store created IDs for cleanup
      createdLocationIds.push(...parsedContent.created_stock_location_ids);
    });

    it('should create multiple stock locations', async () => {
      await connectTestClient();
      const locations = [
        createTestStockLocation({}, { withAddress: true }),
        createTestStockLocation({}, { withAddress: false }),
      ];

      const result = (await client.callTool({
        name: 'create-stock-locations',
        arguments: {
          locations,
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);
      if (!isCreateStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations).toHaveLength(2);
      expect(parsedContent.stock_locations[0].name).toBe(locations[0].name);
      expect(parsedContent.stock_locations[1].name).toBe(locations[1].name);
      expect(parsedContent.created_stock_location_ids).toHaveLength(2);

      // Store created IDs for cleanup
      createdLocationIds.push(...parsedContent.created_stock_location_ids);
    });

    it('should create a stock location with metadata', async () => {
      await connectTestClient();
      const location = createTestStockLocation(
        {
          metadata: {
            test_key: 'test_value',
            is_warehouse: true,
            capacity: 100,
          },
        },
        { withAddress: true },
      );

      const result = (await client.callTool({
        name: 'create-stock-locations',
        arguments: {
          locations: [location],
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);
      if (!isCreateStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations).toHaveLength(1);
      expect(parsedContent.stock_locations[0].name).toBe(location.name);
      expect(parsedContent.stock_locations[0].metadata).toBeDefined();
      expect(parsedContent.stock_locations[0].metadata?.test_key).toBe('test_value');
      expect(parsedContent.stock_locations[0].metadata?.is_warehouse).toBe(true);
      expect(parsedContent.stock_locations[0].metadata?.capacity).toBe(100);
      expect(parsedContent.created_stock_location_ids).toHaveLength(1);

      // Store created IDs for cleanup
      createdLocationIds.push(...parsedContent.created_stock_location_ids);
    });
  });

  describe('validation', () => {
    it('should validate required fields', async () => {
      await connectTestClient();

      try {
        await client.callTool({
          name: 'create-stock-locations',
          arguments: {
            locations: [{ name: '' }],
          },
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('String must contain at least 1 character');
      }
    });

    it('should validate address fields when address is provided', async () => {
      await connectTestClient();

      await expect(
        client.callTool({
          name: 'create-stock-locations',
          arguments: {
            locations: [
              {
                name: 'Test Location',
                address: {
                  // Missing required fields
                  address_1: '123 Test St',
                  // Missing city
                  // Missing country_code
                  postal_code: '12345',
                },
              },
            ],
          },
        }),
      ).rejects.toThrow(/Required|city|country_code/i);
    });

    it('should validate metadata format', async () => {
      await connectTestClient();

      await expect(
        client.callTool({
          name: 'create-stock-locations',
          arguments: {
            locations: [
              {
                name: 'Test Location',
                metadata: 'invalid-metadata' as any,
              },
            ],
          },
        }),
      ).rejects.toThrow(/Expected object|metadata/i);
    });

    it('should require at least one location', async () => {
      await connectTestClient();

      await expect(
        client.callTool({
          name: 'create-stock-locations',
          arguments: {
            locations: [],
          },
        }),
      ).rejects.toThrow(/Array must contain at least|locations/i);
    });
  });
});

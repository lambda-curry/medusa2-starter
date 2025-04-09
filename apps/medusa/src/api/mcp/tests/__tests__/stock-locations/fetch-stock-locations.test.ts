import type { Result } from '@modelcontextprotocol/sdk/types.js';
import { useTestClient } from '../../setup';
import {
  createTestStockLocation,
  isFetchStockLocationsResponse,
  isCreateStockLocationsResponse,
  isDeleteStockLocationsResponse,
  StockLocationAddress,
} from './helpers';

describe('fetch-stock-locations tool', () => {
  const { connectTestClient, getClient } = useTestClient();
  let testLocations: Array<{ id: string; name: string; address?: StockLocationAddress }> = [];
  let client: ReturnType<typeof getClient>;

  beforeAll(async () => {
    client = getClient();
    await connectTestClient();
    // Create test data
    const timestamp = Date.now();
    const locations = [
      createTestStockLocation({}, { name: `Test Stock Location ${timestamp}-1`, withAddress: true }),
      createTestStockLocation({}, { name: `Test Stock Location ${timestamp}-2`, withAddress: false }),
      createTestStockLocation({}, { name: `Test Stock Location ${timestamp}-3`, withAddress: true }),
    ];

    const result = (await client.callTool({
      name: 'create-stock-locations',
      arguments: {
        locations,
      },
    })) as Result & { content: Array<{ text: string }> };

    const parsedContent = JSON.parse(result.content[0].text);

    if (!isCreateStockLocationsResponse(parsedContent)) {
      throw new Error('Invalid response format');
    }
    testLocations = parsedContent.stock_locations;
  });

  afterAll(async () => {
    await connectTestClient();
    // Cleanup test data
    const deleteResult = (await client.callTool({
      name: 'delete-stock-locations',
      arguments: {
        ids: testLocations.map((l) => l.id),
      },
    })) as Result & { content: Array<{ text: string }> };

    const deleteContent = JSON.parse(deleteResult.content[0].text);

    expect(isDeleteStockLocationsResponse(deleteContent)).toBe(true);
    expect(deleteContent.deleted_stock_location_ids).toEqual(testLocations.map((l) => l.id));
  });

  describe('successful fetching', () => {
    it('should fetch all stock locations', async () => {
      await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-stock-locations',
        arguments: {},
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      if (!isFetchStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations.length).toBeGreaterThanOrEqual(testLocations.length);
    });

    it('should fetch stock location by id and verify address', async () => {
      await connectTestClient();
      const testLocation = testLocations.find((l) => l.address); // Find a location with an address
      if (!testLocation) {
        throw new Error('No test locations with addresses found.');
      }

      const result = (await client.callTool({
        name: 'fetch-stock-locations',
        arguments: {
          id: testLocation.id,
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      expect(isFetchStockLocationsResponse(parsedContent)).toBe(true);
      expect(parsedContent.stock_locations).toHaveLength(1);
      expect(parsedContent.stock_locations[0].id).toBe(testLocation.id);
      expect(parsedContent.stock_locations[0].name).toBe(testLocation.name);
      expect(parsedContent.stock_locations[0].address).toBeDefined();
      expect(parsedContent.stock_locations[0].address?.address_1).toBe(testLocation.address?.address_1);
    });

    it('should fetch stock locations by name', async () => {
      await connectTestClient();
      const testLocation = testLocations[0];
      const nameFragment = testLocation.name.split('-')[0]; // Use part of the name for search

      const result = (await client.callTool({
        name: 'fetch-stock-locations',
        arguments: {
          name: nameFragment,
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      if (!isFetchStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations.length).toBeGreaterThanOrEqual(1);
      const foundLocation = parsedContent.stock_locations.some((l) => l.id === testLocation.id);
      expect(foundLocation).toBe(true);
    });

    it('should handle pagination', async () => {
      await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-stock-locations',
        arguments: {
          limit: 2,
          offset: 0,
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      if (!isFetchStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations).toHaveLength(2);
      expect(parsedContent.pagination?.limit).toBe(2);
      expect(parsedContent.pagination?.offset).toBe(0);
    });

    it('should handle custom sorting', async () => {
      await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-stock-locations',
        arguments: {
          order: {
            field: 'name',
            direction: 'ASC',
          },
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      if (!isFetchStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      // Check if the results are sorted by name in ascending order
      const names = parsedContent.stock_locations.map((l) => l.name);
      const sortedNames = [...names].sort();
      expect(names.slice(0, 2)).toEqual(sortedNames.slice(0, 2));
    });
  });

  describe('error handling', () => {
    it('should handle non-existent location id', async () => {
      await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-stock-locations',
        arguments: {
          id: 'non-existent-id',
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      if (!isFetchStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations).toHaveLength(0);
    });

    it('should handle non-existent location name', async () => {
      await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-stock-locations',
        arguments: {
          name: 'non-existent-location-name',
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      if (!isFetchStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations).toHaveLength(0);
      expect(parsedContent.message).toContain('No stock locations found matching name');
    });
  });
});

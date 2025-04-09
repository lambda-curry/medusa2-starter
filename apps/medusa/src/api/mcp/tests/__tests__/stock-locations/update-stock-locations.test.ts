import type { Result } from '@modelcontextprotocol/sdk/types.js';
import { useTestClient } from '../../setup';
import {
  createTestStockLocation,
  isCreateStockLocationsResponse,
  isUpdateStockLocationsResponse,
  isDeleteStockLocationsResponse,
} from './helpers';

describe('update-stock-locations tool', () => {
  const { connectTestClient, getClient } = useTestClient();
  let client: ReturnType<typeof getClient>;
  let testLocations: Array<{ id: string; name: string }> = [];

  beforeAll(async () => {
    client = getClient();
    await connectTestClient();
    // Create test data
    const timestamp = Date.now();
    const locations = [
      createTestStockLocation({}, { name: `Test Stock Location ${timestamp}-1`, withAddress: true }),
      createTestStockLocation({}, { name: `Test Stock Location ${timestamp}-2`, withAddress: false }),
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

  describe('successful updates', () => {
    it('should update a stock location name', async () => {
      await connectTestClient();
      const testLocation = testLocations[0];
      const newName = `Updated Location Name ${Date.now()}`;

      const result = (await client.callTool({
        name: 'update-stock-locations',
        arguments: {
          locations: [
            {
              id: testLocation.id,
              name: newName,
            },
          ],
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      if (!isUpdateStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations).toHaveLength(1);
      expect(parsedContent.stock_locations[0].id).toBe(testLocation.id);
      expect(parsedContent.stock_locations[0].name).toBe(newName);
      expect(parsedContent.updated_stock_location_ids).toEqual([testLocation.id]);
    });

    it('should update stock location metadata', async () => {
      await connectTestClient();
      const testLocation = testLocations[1];
      const newMetadata = {
        is_active: true,
        priority: 1,
        notes: 'Test notes',
      };

      const result = (await client.callTool({
        name: 'update-stock-locations',
        arguments: {
          locations: [
            {
              id: testLocation.id,
              metadata: newMetadata,
            },
          ],
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      if (!isUpdateStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations).toHaveLength(1);
      expect(parsedContent.stock_locations[0].id).toBe(testLocation.id);
      expect(parsedContent.stock_locations[0].metadata).toEqual(newMetadata);
      expect(parsedContent.updated_stock_location_ids).toEqual([testLocation.id]);
    });

    it('should update multiple stock locations', async () => {
      await connectTestClient();
      const updates = testLocations.map((location, index) => ({
        id: location.id,
        name: `Batch Updated Location ${index + 1} - ${Date.now()}`,
      }));

      const result = (await client.callTool({
        name: 'update-stock-locations',
        arguments: {
          locations: updates,
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      if (!isUpdateStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations).toHaveLength(updates.length);
      expect(parsedContent.updated_stock_location_ids).toEqual(testLocations.map((l) => l.id));

      // Verify each location was updated correctly
      for (let i = 0; i < updates.length; i++) {
        const updatedLocation = parsedContent.stock_locations.find((l) => l.id === updates[i].id);
        expect(updatedLocation).toBeDefined();
        expect(updatedLocation?.name).toBe(updates[i].name);
      }
    });

    it('should update both name and metadata', async () => {
      await connectTestClient();
      const testLocation = testLocations[0];
      const newName = `Updated Name and Metadata ${Date.now()}`;
      const newMetadata = {
        is_active: false,
        priority: 2,
        notes: 'Updated notes',
      };

      const result = (await client.callTool({
        name: 'update-stock-locations',
        arguments: {
          locations: [
            {
              id: testLocation.id,
              name: newName,
              metadata: newMetadata,
            },
          ],
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);

      if (!isUpdateStockLocationsResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.stock_locations).toHaveLength(1);
      expect(parsedContent.stock_locations[0].id).toBe(testLocation.id);
      expect(parsedContent.stock_locations[0].name).toBe(newName);
      expect(parsedContent.stock_locations[0].metadata).toEqual(newMetadata);
      expect(parsedContent.updated_stock_location_ids).toEqual([testLocation.id]);
    });
  });

  describe('validation', () => {
    it('should validate location ID exists', async () => {
      await connectTestClient();

      const result = (await client.callTool({
        name: 'update-stock-locations',
        arguments: {
          locations: [
            {
              id: 'non-existent-id',
              name: 'Updated Name',
            },
          ],
        },
      })) as Result & { content: Array<{ text: string }> };
      expect(result.content[0].text).toContain('"error": true');
      expect(result.content[0].text).toContain("Cannot read properties of undefined (reading 'id')");
    });

    it('should validate metadata format', async () => {
      await connectTestClient();
      const testLocation = testLocations[0];

      await expect(
        client.callTool({
          name: 'update-stock-locations',
          arguments: {
            locations: [
              {
                id: testLocation.id,
                metadata: 'invalid-metadata' as any,
              },
            ],
          },
        }),
      ).rejects.toThrow(/Expected object, received string/i);
    });

    it('should require at least one location', async () => {
      await connectTestClient();

      await expect(
        client.callTool({
          name: 'update-stock-locations',
          arguments: {
            locations: [],
          },
        }),
      ).rejects.toThrow(/Array must contain at least|locations/i);
    });
  });
});

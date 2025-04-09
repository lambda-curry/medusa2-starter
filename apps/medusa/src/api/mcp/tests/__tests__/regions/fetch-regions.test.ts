import { useTestClient } from '../../setup';

interface Content {
  text: string;
}

interface TypedResult {
  content: Content[];
}

interface RegionResponse {
  regions: Array<{
    id: string;
    name: string;
    currency_code: string;
    countries: string[];
    payment_providers: string[];
  }>;
  count: number;
}

describe('MCP Region Tool Integration', () => {
  const { connectTestClient } = useTestClient();

  describe('Region Fetching', () => {
    it('should fetch all regions', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-regions',
        arguments: {},
      })) as TypedResult;

      expect(result.content).toBeDefined();
      const content = JSON.parse(result.content[0].text) as RegionResponse;
      expect(Array.isArray(content.regions)).toBe(true);
      expect(content.regions.length).toBeGreaterThan(0);
      expect(content.count).toBe(content.regions.length);

      // Check that US and Canada regions exist
      const usRegion = content.regions.find((r) => r.name === 'United States');
      const caRegion = content.regions.find((r) => r.name === 'Canada');

      expect(usRegion).toBeDefined();
      expect(caRegion).toBeDefined();
      expect(usRegion?.currency_code).toBe('usd');
      expect(caRegion?.currency_code).toBe('cad');
    });

    it('should filter regions by currency_code', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-regions',
        arguments: {
          currency_code: 'usd',
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as RegionResponse;
      expect(content.regions.length).toBeGreaterThan(0);
      expect(content.regions.every((r) => r.currency_code === 'usd')).toBe(true);
    });

    it('should filter regions by name', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-regions',
        arguments: {
          name: 'United States',
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as RegionResponse;
      expect(content.regions.length).toBe(1);
      expect(content.regions[0].name).toBe('United States');
      expect(content.regions[0].currency_code).toBe('usd');
    });

    it('should handle empty results gracefully', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-regions',
        arguments: {
          name: 'Nonexistent Region',
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as RegionResponse;
      expect(Array.isArray(content.regions)).toBe(true);
      expect(content.regions.length).toBe(0);
      expect(content.count).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid parameters', async () => {
      const { client } = await connectTestClient();

      await expect(
        client.callTool({
          name: 'fetch-regions',
          arguments: { currency_code: 123 as any },
        }),
      ).rejects.toThrow('Invalid arguments for tool fetch-regions');
    });
  });
});

import { useTestClient } from '../../setup';

interface Content {
  text: string;
}

interface TypedResult {
  content: Content[];
}

interface SalesChannelResponse {
  sales_channels: Array<{
    id: string;
    name: string;
    description: string | null;
    is_disabled: boolean;
  }>;
  count: number;
}

describe('MCP Sales Channel Tool Integration', () => {
  const { connectTestClient } = useTestClient();

  describe('Sales Channel Fetching', () => {
    it('should fetch all sales channels', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-sales-channels',
        arguments: {},
      })) as TypedResult;

      expect(result.content).toBeDefined();
      const content = JSON.parse(result.content[0].text) as SalesChannelResponse;
      expect(Array.isArray(content.sales_channels)).toBe(true);
      expect(content.sales_channels.length).toBeGreaterThan(0);
      expect(content.count).toBe(content.sales_channels.length);

      // Check that default sales channel exists
      const defaultChannel = content.sales_channels.find((sc) => sc.name === 'Default Sales Channel');
      expect(defaultChannel).toBeDefined();
      expect(defaultChannel?.is_disabled).toBe(false);
    });

    it('should filter sales channels by name (string)', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-sales-channels',
        arguments: {
          name: 'Default Sales Channel',
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as SalesChannelResponse;
      expect(content.sales_channels.length).toBe(1);
      expect(content.sales_channels[0].name).toBe('Default Sales Channel');
      expect(content.sales_channels[0].is_disabled).toBe(false);
    });

    it('should filter sales channels by name (array)', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-sales-channels',
        arguments: {
          name: ['Default Sales Channel', 'B2B Channel'],
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as SalesChannelResponse;
      expect(content.sales_channels.length).toBeGreaterThan(0);
      expect(content.sales_channels.every((sc) => ['Default Sales Channel', 'B2B Channel'].includes(sc.name))).toBe(
        true,
      );
    });

    it('should search sales channels using q parameter', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-sales-channels',
        arguments: {
          q: 'Default sales channel',
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as SalesChannelResponse;
      expect(content.sales_channels.length).toBeGreaterThan(0);
      const hasMatch = content.sales_channels.some(
        (sc) =>
          sc.name.toLowerCase().includes('default sales channel') ||
          (sc.description?.toLowerCase().includes('default sales channel') ?? false),
      );
      expect(hasMatch).toBe(true);
    });

    it('should filter sales channels by disabled status', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-sales-channels',
        arguments: {
          is_disabled: false,
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as SalesChannelResponse;
      expect(content.sales_channels.length).toBeGreaterThan(0);
      expect(content.sales_channels.every((sc) => !sc.is_disabled)).toBe(true);
    });

    it('should filter sales channels by ID (array)', async () => {
      const { client } = await connectTestClient();

      // First get some IDs
      const allChannels = (await client.callTool({
        name: 'fetch-sales-channels',
        arguments: {},
      })) as TypedResult;

      const content = JSON.parse(allChannels.content[0].text) as SalesChannelResponse;
      const ids = content.sales_channels.slice(0, 2).map((sc) => sc.id);

      const result = (await client.callTool({
        name: 'fetch-sales-channels',
        arguments: {
          id: ids,
        },
      })) as TypedResult;

      const filteredContent = JSON.parse(result.content[0].text) as SalesChannelResponse;
      expect(filteredContent.sales_channels.length).toBe(ids.length);
      expect(filteredContent.sales_channels.every((sc) => ids.includes(sc.id))).toBe(true);
    });

    it('should handle empty results gracefully', async () => {
      const { client } = await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-sales-channels',
        arguments: {
          name: 'Nonexistent Sales Channel',
        },
      })) as TypedResult;

      const content = JSON.parse(result.content[0].text) as SalesChannelResponse;
      expect(Array.isArray(content.sales_channels)).toBe(true);
      expect(content.sales_channels.length).toBe(0);
      expect(content.count).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid parameters', async () => {
      const { client } = await connectTestClient();

      await expect(
        client.callTool({
          name: 'fetch-sales-channels',
          arguments: { is_disabled: 'invalid' as any },
        }),
      ).rejects.toThrow('Invalid arguments for tool fetch-sales-channels');
    });
  });
});

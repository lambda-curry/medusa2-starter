import { useTestClient, waitForSSEConnection } from '../setup';
import { ServerCapabilities, ServerCapabilitiesSchema } from '@modelcontextprotocol/sdk/types.js';

describe('MCP Client Setup Integration Tests', () => {
  const { connectTestClient, getTransport, getClient } = useTestClient();

  describe('Client Initialization', () => {
    it('should successfully connect to the server', async () => {
      const { client } = await connectTestClient();

      const capabilities = client.getServerCapabilities() as ServerCapabilities;
      expect(capabilities).toBeDefined();
      expect(() => ServerCapabilitiesSchema.parse(capabilities)).not.toThrow();
    });

    it('should negotiate protocol version', async () => {
      const { client } = await connectTestClient();

      const version = client.getServerVersion();
      expect(version).toBeDefined();
      expect(version?.name).toBeDefined();
      expect(version?.version).toBeDefined();
    });

    it('should have required capabilities', async () => {
      const { client } = await connectTestClient();

      const capabilities = client.getServerCapabilities() as ServerCapabilities;
      ServerCapabilitiesSchema.parse(capabilities); // Validate first

      // Just check that the tools object exists, not its contents
      expect(capabilities.tools).toBeDefined();
    });

    it('should validate server capabilities schema', async () => {
      const { client } = await connectTestClient();

      const capabilities = client.getServerCapabilities() as ServerCapabilities;
      expect(() => ServerCapabilitiesSchema.parse(capabilities)).not.toThrow();
    });
  });

  describe('Client Disconnection', () => {
    const DISCONNECT_TIMEOUT = 1000;

    const waitForDisconnect = async (transport: any) => {
      return new Promise<void>((resolve) => {
        transport.onclose = () => resolve();
        setTimeout(resolve, DISCONNECT_TIMEOUT);
      });
    };

    it('should handle graceful disconnection', async () => {
      const { client, transport } = await connectTestClient();

      const initialCapabilities = client.getServerCapabilities();
      expect(initialCapabilities?.tools).toBeDefined();

      await transport.close();
      await waitForDisconnect(transport);

      // After disconnection, capabilities remain cached
      const capabilities = client.getServerCapabilities();
      expect(capabilities?.tools).toBeDefined();
    }, 15000);

    // Skipping this test due to a limitation in the SSE client transport
    // The SDK's SSEClientTransport doesn't support reconnection with the same client instance
    // as it maintains internal state that causes "SSEClientTransport already started!" errors
    // note: Consider creating a new client instance for reconnection or wait for SDK update
    it.skip('should handle reconnection', async () => {
      const { client, transport } = await connectTestClient();

      const initialCapabilities = client.getServerCapabilities();
      expect(initialCapabilities?.tools).toBeDefined();

      // Close and wait for cleanup
      await transport.close();
      await waitForDisconnect(transport);

      // Wait a bit to ensure complete cleanup
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a new transport for reconnection
      const newTransport = getTransport();
      newTransport.onclose = undefined; // Reset event handlers
      newTransport.onerror = undefined;
      newTransport.onmessage = undefined;

      await client.connect(newTransport);
      await waitForSSEConnection(client);

      const capabilities = client.getServerCapabilities() as ServerCapabilities;
      expect(() => ServerCapabilitiesSchema.parse(capabilities)).not.toThrow();
      expect(capabilities?.tools).toBeDefined();
    }, 15000);

    it('should handle connection errors', async () => {
      const transport = getTransport();
      await transport.close();

      const client = getClient();
      try {
        await client.connect(transport);
        fail('Expected connection to fail');
      } catch (error) {
        expect(error).toBeDefined();
      }
    }, 15000);

    it('should handle transport interruption', async () => {
      const { client, transport } = await connectTestClient();

      // Verify initial state
      const initialCapabilities = client.getServerCapabilities();
      expect(initialCapabilities?.tools).toBeDefined();

      // Simulate transport interruption
      await transport.close();

      // Verify capabilities are still cached immediately after interruption
      const capabilities = client.getServerCapabilities();
      expect(capabilities?.tools).toBeDefined();
      expect(capabilities).toEqual(initialCapabilities); // Should be the same object
    }, 5000);
  });

  describe('Error Handling', () => {
    it('should handle invalid capabilities gracefully', async () => {
      const { client } = await connectTestClient();

      await expect(
        client.callTool({
          name: 'invalid-tool',
          arguments: {},
        }),
      ).rejects.toThrow();
    });
  });

  describe('Protocol Compliance', () => {
    it('should follow initialization flow', async () => {
      const { client } = await connectTestClient();

      const capabilities = client.getServerCapabilities() as ServerCapabilities;
      const version = client.getServerVersion();

      expect(capabilities).toBeDefined();
      expect(version).toBeDefined();
      expect(() => ServerCapabilitiesSchema.parse(capabilities)).not.toThrow();
    });
  });
});

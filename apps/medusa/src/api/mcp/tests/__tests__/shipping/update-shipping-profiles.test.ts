import type { Result } from '@modelcontextprotocol/sdk/types.js';
import { useTestClient } from '../../setup';
import {
  createTestShippingProfile,
  isCreateShippingProfilesResponse,
  isDeleteShippingProfilesResponse,
  isFetchShippingProfilesResponse,
} from './helpers';

describe('update-shipping-profiles tool', () => {
  const { connectTestClient, getClient } = useTestClient();
  let client: ReturnType<typeof getClient>;

  beforeAll(async () => {
    client = getClient();
    await connectTestClient();
  });

  describe('successful updates', () => {
    it('should update a single shipping profile', async () => {
      await connectTestClient();
      // Create a test profile
      const timestamp = Date.now();
      const shippingProfile = createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}` });

      const createResult = (await client.callTool({
        name: 'create-shipping-profiles',
        arguments: {
          shipping_profiles: [shippingProfile],
        },
      })) as Result & { content: Array<{ text: string }> };

      const createContent = JSON.parse(createResult.content[0].text);
      if (!isCreateShippingProfilesResponse(createContent)) {
        throw new Error('Invalid create response format');
      }
      const profileId = createContent.shipping_profiles[0].id;

      // Update the profile
      const newName = `Updated Profile ${timestamp}`;
      const updateResult = (await client.callTool({
        name: 'update-shipping-profiles',
        arguments: {
          selector: {
            id: profileId,
          },
          update: {
            name: newName,
            metadata: { updated: true },
          },
        },
      })) as Result & { content: Array<{ text: string }> };

      const updateContent = JSON.parse(updateResult.content[0].text);
      expect(updateContent.shipping_profiles).toHaveLength(1);
      expect(updateContent.message).toBe('Successfully updated 1 shipping profile(s)');
      expect(updateContent.updated_shipping_profile_ids).toEqual([profileId]);

      // Verify the update
      const fetchResult = (await client.callTool({
        name: 'fetch-shipping-profiles',
        arguments: {
          id: profileId,
        },
      })) as Result & { content: Array<{ text: string }> };

      const fetchContent = JSON.parse(fetchResult.content[0].text);
      if (!isFetchShippingProfilesResponse(fetchContent)) {
        throw new Error('Invalid fetch response format');
      }

      expect(fetchContent.shipping_profiles).toHaveLength(1);
      expect(fetchContent.shipping_profiles[0].name).toBe(newName);
      expect(fetchContent.shipping_profiles[0].metadata).toEqual({ updated: true });

      // Cleanup
      const deleteResult = (await client.callTool({
        name: 'delete-shipping-profiles',
        arguments: {
          ids: [profileId],
        },
      })) as Result & { content: Array<{ text: string }> };

      const deleteContent = JSON.parse(deleteResult.content[0].text);
      expect(isDeleteShippingProfilesResponse(deleteContent)).toBe(true);
    });

    it('should update multiple shipping profiles', async () => {
      await connectTestClient();
      // Create test profiles
      const timestamp = Date.now();
      const profiles = [
        createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}-1`, type: 'default' }),
        createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}-2`, type: 'custom' }),
      ];

      const createResult = (await client.callTool({
        name: 'create-shipping-profiles',
        arguments: {
          shipping_profiles: profiles,
        },
      })) as Result & { content: Array<{ text: string }> };

      const createContent = JSON.parse(createResult.content[0].text);
      if (!isCreateShippingProfilesResponse(createContent)) {
        throw new Error('Invalid create response format');
      }
      const profileIds = createContent.shipping_profiles.map((p) => p.id);

      // Update the profiles
      const metadata = { batch_updated: true };
      const updateResult = (await client.callTool({
        name: 'update-shipping-profiles',
        arguments: {
          selector: {
            id: profileIds,
          },
          update: {
            metadata,
          },
        },
      })) as Result & { content: Array<{ text: string }> };

      const updateContent = JSON.parse(updateResult.content[0].text);
      expect(updateContent.shipping_profiles).toHaveLength(2);
      expect(updateContent.message).toBe('Successfully updated 2 shipping profile(s)');
      expect(updateContent.updated_shipping_profile_ids.sort()).toEqual(profileIds.sort());

      // Verify the updates
      const fetchResult = (await client.callTool({
        name: 'fetch-shipping-profiles',
        arguments: {
          id: profileIds[0],
        },
      })) as Result & { content: Array<{ text: string }> };

      const fetchContent = JSON.parse(fetchResult.content[0].text);
      if (!isFetchShippingProfilesResponse(fetchContent)) {
        throw new Error('Invalid fetch response format');
      }

      expect(fetchContent.shipping_profiles).toHaveLength(1);
      expect(fetchContent.shipping_profiles[0].metadata).toEqual(metadata);

      // Cleanup
      const deleteResult = (await client.callTool({
        name: 'delete-shipping-profiles',
        arguments: {
          ids: profileIds,
        },
      })) as Result & { content: Array<{ text: string }> };

      const deleteContent = JSON.parse(deleteResult.content[0].text);
      expect(isDeleteShippingProfilesResponse(deleteContent)).toBe(true);
    });
  });

  describe('validation', () => {
    it('should validate required fields', async () => {
      await connectTestClient();
      await expect(
        client.callTool({
          name: 'update-shipping-profiles',
          arguments: {
            update: {
              name: 'New Name',
            },
          } as any,
        }),
      ).rejects.toThrow();
    });

    it('should validate shipping profile type', async () => {
      await connectTestClient();
      // Create a test profile
      const timestamp = Date.now();
      const shippingProfile = createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}` });

      const createResult = (await client.callTool({
        name: 'create-shipping-profiles',
        arguments: {
          shipping_profiles: [shippingProfile],
        },
      })) as Result & { content: Array<{ text: string }> };

      const createContent = JSON.parse(createResult.content[0].text);
      if (!isCreateShippingProfilesResponse(createContent)) {
        throw new Error('Invalid create response format');
      }
      const profileId = createContent.shipping_profiles[0].id;

      // Try to update with invalid type
      await expect(
        client.callTool({
          name: 'update-shipping-profiles',
          arguments: {
            selector: {
              id: profileId,
            },
            update: {
              type: 'invalid' as any,
            },
          },
        }),
      ).rejects.toThrow();

      // Cleanup
      await client.callTool({
        name: 'delete-shipping-profiles',
        arguments: {
          ids: [profileId],
        },
      });
    });

    it('should handle non-existent profile id', async () => {
      await connectTestClient();
      const updateResult = (await client.callTool({
        name: 'update-shipping-profiles',
        arguments: {
          selector: {
            id: 'non-existent-id',
          },
          update: {
            name: 'New Name',
          },
        },
      })) as Result & { content: Array<{ text: string }> };

      const updateContent = JSON.parse(updateResult.content[0].text);
      expect(updateContent.shipping_profiles).toHaveLength(0);
      expect(updateContent.message).toBe('Successfully updated 0 shipping profile(s)');
      expect(updateContent.updated_shipping_profile_ids).toEqual([]);
    });
  });
});

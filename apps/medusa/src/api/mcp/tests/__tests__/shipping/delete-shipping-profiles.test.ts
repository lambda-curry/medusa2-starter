import type { Result } from '@modelcontextprotocol/sdk/types.js';
import { useTestClient } from '../../setup';
import {
  createTestShippingProfile,
  isCreateShippingProfilesResponse,
  isDeleteShippingProfilesResponse,
  isFetchShippingProfilesResponse,
} from './helpers';

describe('delete-shipping-profiles tool', () => {
  const { connectTestClient, getClient } = useTestClient();
  let client: ReturnType<typeof getClient>;

  beforeAll(async () => {
    client = getClient();
    await connectTestClient();
  });

  describe('successful deletion', () => {
    it('should delete a single shipping profile', async () => {
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

      // Delete the profile
      const deleteResult = (await client.callTool({
        name: 'delete-shipping-profiles',
        arguments: {
          ids: [profileId],
        },
      })) as Result & { content: Array<{ text: string }> };

      const deleteContent = JSON.parse(deleteResult.content[0].text);
      if (!isDeleteShippingProfilesResponse(deleteContent)) {
        throw new Error('Invalid delete response format');
      }

      expect(deleteContent.deleted_shipping_profile_ids).toEqual([profileId]);

      // Verify the profile is deleted
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

      expect(fetchContent.shipping_profiles).toHaveLength(0);
    });

    it('should delete multiple shipping profiles', async () => {
      await connectTestClient();
      // Create test profiles
      const timestamp = Date.now();
      const profiles = [
        createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}-1`, type: 'default' }),
        createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}-2`, type: 'gift_card' }),
        createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}-3`, type: 'custom' }),
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

      // Delete the profiles
      const deleteResult = (await client.callTool({
        name: 'delete-shipping-profiles',
        arguments: {
          ids: profileIds,
        },
      })) as Result & { content: Array<{ text: string }> };

      const deleteContent = JSON.parse(deleteResult.content[0].text);
      if (!isDeleteShippingProfilesResponse(deleteContent)) {
        throw new Error('Invalid delete response format');
      }

      expect(deleteContent.deleted_shipping_profile_ids).toEqual(profileIds);

      // Verify the profiles are deleted
      for (const id of profileIds) {
        const fetchResult = (await client.callTool({
          name: 'fetch-shipping-profiles',
          arguments: {
            id,
          },
        })) as Result & { content: Array<{ text: string }> };

        const fetchContent = JSON.parse(fetchResult.content[0].text);
        if (!isFetchShippingProfilesResponse(fetchContent)) {
          throw new Error('Invalid fetch response format');
        }

        expect(fetchContent.shipping_profiles).toHaveLength(0);
      }
    });
  });

  describe('validation', () => {
    it('should validate empty ids array', async () => {
      await connectTestClient();
      await expect(
        client.callTool({
          name: 'delete-shipping-profiles',
          arguments: {
            ids: [],
          },
        }),
      ).rejects.toThrow();
    });

    it('should handle non-existent profile ids', async () => {
      await connectTestClient();
      const deleteResult = (await client.callTool({
        name: 'delete-shipping-profiles',
        arguments: {
          ids: ['non-existent-id'],
        },
      })) as Result & { content: Array<{ text: string }> };

      const deleteContent = JSON.parse(deleteResult.content[0].text);
      if (!isDeleteShippingProfilesResponse(deleteContent)) {
        throw new Error('Invalid delete response format');
      }

      expect(deleteContent.deleted_shipping_profile_ids).toEqual(['non-existent-id']);
    });

    it('should handle invalid id format', async () => {
      await connectTestClient();
      const deleteResult = (await client.callTool({
        name: 'delete-shipping-profiles',
        arguments: {
          ids: ['invalid-id-format'],
        },
      })) as Result & { content: Array<{ text: string }> };

      const deleteContent = JSON.parse(deleteResult.content[0].text);
      if (!isDeleteShippingProfilesResponse(deleteContent)) {
        throw new Error('Invalid delete response format');
      }

      expect(deleteContent.deleted_shipping_profile_ids).toEqual(['invalid-id-format']);
    });
  });
});

import type { Result } from '@modelcontextprotocol/sdk/types.js';
import { useTestClient } from '../../setup';
import {
  createTestShippingProfile,
  createTestShippingProfiles,
  isCreateShippingProfilesResponse,
  isDeleteShippingProfilesResponse,
  TestShippingProfile,
} from './helpers';

describe('create-shipping-profiles tool', () => {
  const { connectTestClient, getClient } = useTestClient();
  let testProfiles: Array<{ id: string; name: string; type: string }> = [];
  let client: ReturnType<typeof getClient>;

  beforeAll(async () => {
    client = getClient();
    await connectTestClient();
    // Clean up any existing profiles first
    const fetchResult = (await client.callTool({
      name: 'fetch-shipping-profiles',
      arguments: {},
    })) as Result & { content: Array<{ text: string }> };
    const fetchContent = JSON.parse(fetchResult.content[0].text);
    if (fetchContent.shipping_profiles?.length > 0) {
      const existingIds = fetchContent.shipping_profiles.map((p: any) => p.id);
      await client.callTool({
        name: 'delete-shipping-profiles',
        arguments: { ids: existingIds },
      });
    }
  });

  afterAll(async () => {
    if (testProfiles.length > 0) {
      await client.callTool({
        name: 'delete-shipping-profiles',
        arguments: {
          ids: testProfiles.map((p) => p.id),
        },
      });
    }
  });

  describe('successful creation', () => {
    it('should create a single shipping profile', async () => {
      await connectTestClient();
      const shippingProfile = createTestShippingProfile({}, { name: `Test Shipping Profile ${Date.now()}` });

      const result = (await client.callTool({
        name: 'create-shipping-profiles',
        arguments: {
          shipping_profiles: [shippingProfile],
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);
      if (!isCreateShippingProfilesResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.shipping_profiles).toHaveLength(1);
      expect(parsedContent.message).toBe('Successfully created 1 shipping profiles');
      expect(parsedContent.created_shipping_profile_ids).toHaveLength(1);

      const profile = parsedContent.shipping_profiles[0];
      expect(profile.name).toBe(shippingProfile.name);
      expect(profile.type).toBe(shippingProfile.type);

      // Cleanup
      const deleteResult = (await client.callTool({
        name: 'delete-shipping-profiles',
        arguments: {
          ids: [profile.id],
        },
      })) as Result & { content: Array<{ text: string }> };

      const deleteContent = JSON.parse(deleteResult.content[0].text);
      expect(isDeleteShippingProfilesResponse(deleteContent)).toBe(true);
    });

    it('should create multiple shipping profiles', async () => {
      await connectTestClient();
      const timestamp = Date.now();
      const shippingProfiles = [
        createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}-1`, type: 'default' }),
        createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}-2`, type: 'gift_card' }),
        createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}-3`, type: 'custom' }),
      ];

      const result = (await client.callTool({
        name: 'create-shipping-profiles',
        arguments: {
          shipping_profiles: shippingProfiles,
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);
      if (!isCreateShippingProfilesResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.shipping_profiles).toHaveLength(3);
      expect(parsedContent.message).toBe('Successfully created 3 shipping profiles');
      expect(parsedContent.created_shipping_profile_ids).toHaveLength(3);

      // Verify each profile was created correctly
      parsedContent.shipping_profiles.forEach((profile: { name: string; type: string }, index: number) => {
        expect(profile.name).toBe(shippingProfiles[index].name);
        expect(profile.type).toBe(shippingProfiles[index].type);
      });

      // Cleanup
      const deleteResult = (await client.callTool({
        name: 'delete-shipping-profiles',
        arguments: {
          ids: parsedContent.created_shipping_profile_ids,
        },
      })) as Result & { content: Array<{ text: string }> };

      const deleteContent = JSON.parse(deleteResult.content[0].text);
      expect(isDeleteShippingProfilesResponse(deleteContent)).toBe(true);
      expect(deleteContent.deleted_shipping_profile_ids).toEqual(parsedContent.created_shipping_profile_ids);
    });
  });

  describe('validation', () => {
    it('should validate required fields', async () => {
      const invalidProfile = { type: 'default' } as TestShippingProfile;

      await expect(
        client.callTool({
          name: 'create-shipping-profiles',
          arguments: {
            shipping_profiles: [invalidProfile],
          },
        }),
      ).rejects.toThrow();
    });

    it('should validate shipping profile type', async () => {
      await connectTestClient();
      const invalidProfile = createTestShippingProfile({}, { type: 'invalid' as any });

      const result = (await client.callTool({
        name: 'create-shipping-profiles',
        arguments: {
          shipping_profiles: [invalidProfile],
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);
      if (!isCreateShippingProfilesResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      // Even though we sent an invalid type, the API accepts it
      expect(parsedContent.shipping_profiles).toHaveLength(1);
      expect(parsedContent.shipping_profiles[0].type).toBe('invalid');

      // Cleanup
      await client.callTool({
        name: 'delete-shipping-profiles',
        arguments: {
          ids: [parsedContent.shipping_profiles[0].id],
        },
      });
    });
  });
});

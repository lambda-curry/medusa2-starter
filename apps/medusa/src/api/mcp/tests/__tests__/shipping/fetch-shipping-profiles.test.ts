import type { Result } from '@modelcontextprotocol/sdk/types.js';
import { useTestClient } from '../../setup';
import {
  createTestShippingProfiles,
  isCreateShippingProfilesResponse,
  isFetchShippingProfilesResponse,
  isDeleteShippingProfilesResponse,
  createTestShippingProfile,
} from './helpers';

describe('fetch-shipping-profiles tool', () => {
  const { connectTestClient, getClient } = useTestClient();
  let testProfiles: Array<{ id: string; name: string; type: string }> = [];
  let client: ReturnType<typeof getClient>;

  beforeAll(async () => {
    client = getClient();
    await connectTestClient();
    // Create test data
    const timestamp = Date.now();
    const profiles = [
      createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}-1`, type: 'default' }),
      createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}-2`, type: 'gift_card' }),
      createTestShippingProfile({}, { name: `Test Shipping Profile ${timestamp}-3`, type: 'custom' }),
    ];

    const result = (await client.callTool({
      name: 'create-shipping-profiles',
      arguments: {
        shipping_profiles: profiles,
      },
    })) as Result & { content: Array<{ text: string }> };

    const parsedContent = JSON.parse(result.content[0].text);
    if (!isCreateShippingProfilesResponse(parsedContent)) {
      throw new Error('Invalid response format');
    }
    testProfiles = parsedContent.shipping_profiles;
  });

  afterAll(async () => {
    await connectTestClient();
    // Cleanup test data
    const deleteResult = (await client.callTool({
      name: 'delete-shipping-profiles',
      arguments: {
        ids: testProfiles.map((p) => p.id),
      },
    })) as Result & { content: Array<{ text: string }> };

    const deleteContent = JSON.parse(deleteResult.content[0].text);
    expect(isDeleteShippingProfilesResponse(deleteContent)).toBe(true);
    expect(deleteContent.deleted_shipping_profile_ids).toEqual(testProfiles.map((p) => p.id));
  });

  describe('successful fetching', () => {
    it('should fetch all shipping profiles', async () => {
      await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-shipping-profiles',
        arguments: {},
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);
      if (!isFetchShippingProfilesResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.shipping_profiles.length).toBeGreaterThanOrEqual(testProfiles.length);
    });

    it('should fetch shipping profile by id', async () => {
      await connectTestClient();
      const testProfile = testProfiles[0];

      const result = (await client.callTool({
        name: 'fetch-shipping-profiles',
        arguments: {
          id: testProfile.id,
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);
      if (!isFetchShippingProfilesResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.shipping_profiles).toHaveLength(1);
      expect(parsedContent.shipping_profiles[0].id).toBe(testProfile.id);
      expect(parsedContent.shipping_profiles[0].name).toBe(testProfile.name);
    });

    it('should fetch shipping profiles by type', async () => {
      await connectTestClient();
      const defaultProfile = testProfiles.find((p) => p.type === 'default');

      // First get the total count of default profiles
      const countResult = (await client.callTool({
        name: 'fetch-shipping-profiles',
        arguments: {
          type: 'default',
          limit: 1,
        },
      })) as Result & { content: Array<{ text: string }> };

      const countContent = JSON.parse(countResult.content[0].text);
      const totalCount = countContent.count;

      // Now fetch all profiles to ensure we don't miss any due to pagination
      const result = (await client.callTool({
        name: 'fetch-shipping-profiles',
        arguments: {
          type: 'default',
          limit: totalCount, // Set limit to total count to get all profiles
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);
      if (!isFetchShippingProfilesResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.shipping_profiles.length).toBeGreaterThanOrEqual(1);
      const foundProfile = parsedContent.shipping_profiles.some((p) => p.id === defaultProfile?.id);
      expect(foundProfile).toBe(true);
    });

    it('should handle pagination', async () => {
      await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-shipping-profiles',
        arguments: {
          limit: 2,
          offset: 0,
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);
      if (!isFetchShippingProfilesResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.shipping_profiles).toHaveLength(2);
      expect(parsedContent.pagination?.limit).toBe(2);
      expect(parsedContent.pagination?.offset).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle non-existent profile id', async () => {
      await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-shipping-profiles',
        arguments: {
          id: 'non-existent-id',
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);
      if (!isFetchShippingProfilesResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.shipping_profiles).toHaveLength(0);
    });

    it('should handle invalid type filter', async () => {
      await connectTestClient();

      const result = (await client.callTool({
        name: 'fetch-shipping-profiles',
        arguments: {
          type: 'invalid-type',
        },
      })) as Result & { content: Array<{ text: string }> };

      expect(result.content).toHaveLength(1);
      const parsedContent = JSON.parse(result.content[0].text);
      if (!isFetchShippingProfilesResponse(parsedContent)) {
        throw new Error('Invalid response format');
      }

      expect(parsedContent.shipping_profiles).toHaveLength(0);
      expect(parsedContent.count).toBe(0);
    });
  });
});

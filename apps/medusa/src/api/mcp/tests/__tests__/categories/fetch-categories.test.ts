import { describe, expect, it } from '@jest/globals';
import { ProductCategoryDTO } from '@medusajs/types';
import { CategoryResult, FetchCategoriesResponse } from './types';
import { cleanupCategories, createTestCategory, parseCategoryResponse, buildDeepHierarchy } from './helpers';
import { useTestClient } from '../../setup';
import { type CreateCategoriesResponse } from './helpers';

describe('fetch-categories tool', () => {
  const { getClient, connectTestClient } = useTestClient();
  let testData: {
    categoryIds: string[];
  } = {
    categoryIds: [],
  };

  beforeAll(async () => {
    await connectTestClient();
  });

  beforeEach(() => {
    testData = {
      categoryIds: [],
    };
  });

  afterEach(async () => {
    const client = getClient();
    await cleanupCategories(client, testData.categoryIds);
  });

  describe('success cases', () => {
    it('should fetch all categories', async () => {
      const client = getClient();
      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory(), createTestCategory(), createTestCategory()],
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      testData.categoryIds.push(...createResponse.created_category_ids);

      const fetchResult = (await client.callTool({
        name: 'fetch-categories',
        arguments: {},
      })) as CategoryResult;

      const fetchResponse = parseCategoryResponse(fetchResult) as FetchCategoriesResponse;
      expect(fetchResponse.categories.length).toBeGreaterThanOrEqual(3);
      expect(fetchResponse.count).toBeGreaterThanOrEqual(3);
      expect(fetchResponse.pagination).toBeDefined();
      expect(fetchResponse.hierarchy_info).toBeDefined();
    });

    it('should fetch categories by name search', async () => {
      const client = getClient();
      const searchName = `Test Category ${Date.now()}`;
      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory({ name: searchName })],
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      testData.categoryIds.push(...createResponse.created_category_ids);

      const fetchResult = (await client.callTool({
        name: 'fetch-categories',
        arguments: {
          query: searchName,
        },
      })) as CategoryResult;

      const fetchResponse = parseCategoryResponse(fetchResult) as FetchCategoriesResponse;
      expect(fetchResponse.categories.some((c) => c.name === searchName)).toBe(true);
    });

    it.skip('should fetch category hierarchy', async () => {
      const client = getClient();
      const parentResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory()],
        },
      })) as CategoryResult;

      const parentResponse = parseCategoryResponse(parentResult) as CreateCategoriesResponse;
      const parent = parentResponse.categories[0];
      testData.categoryIds.push(parent.id);

      const childResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory({ parent_category_id: parent.id })],
        },
      })) as CategoryResult;

      const childResponse = parseCategoryResponse(childResult) as CreateCategoriesResponse;
      const child = childResponse.categories[0];
      testData.categoryIds.push(child.id);

      const fetchResult = (await client.callTool({
        name: 'fetch-categories',
        arguments: {
          query: parent.name,
        },
      })) as CategoryResult;

      const fetchResponse = parseCategoryResponse(fetchResult) as FetchCategoriesResponse;
      expect(fetchResponse.categories.length).toBeGreaterThanOrEqual(1);
      const fetchedParent = fetchResponse.categories.find((c) => c.id === parent.id);
      expect(fetchedParent).toBeDefined();
      expect(fetchedParent?.category_children).toBeDefined();
      expect(fetchedParent?.category_children?.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle pagination', async () => {
      const client = getClient();
      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: Array(5)
            .fill(null)
            .map(() => createTestCategory()),
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      testData.categoryIds.push(...createResponse.created_category_ids);

      const fetchResult = (await client.callTool({
        name: 'fetch-categories',
        arguments: {
          limit: 2,
          offset: 0,
        },
      })) as CategoryResult;

      const fetchResponse = parseCategoryResponse(fetchResult) as FetchCategoriesResponse;
      expect(fetchResponse.categories).toHaveLength(2);
      expect(fetchResponse.pagination).toBeDefined();
      expect(fetchResponse.pagination?.limit).toBe(2);
      expect(fetchResponse.pagination?.offset).toBe(0);
      expect(fetchResponse.pagination?.total).toBeGreaterThanOrEqual(5);
    });
  });

  describe('performance', () => {
    it.skip('should handle deep hierarchies efficiently', async () => {
      const client = getClient();
      const categories = await buildDeepHierarchy(client, 5);
      testData.categoryIds.push(...categories.map((c) => c.id));

      // console.log(
      //   'Created categories:',
      //   categories.map((c) => ({
      //     id: c.id,
      //     name: c.name,
      //     parent_id: c.parent_category_id,
      //   })),
      // );

      const fetchResult = (await client.callTool({
        name: 'fetch-categories',
        arguments: {
          query: categories[0].name,
        },
      })) as CategoryResult;

      const fetchResponse = parseCategoryResponse(fetchResult) as FetchCategoriesResponse;
      // console.log('Fetch response:', fetchResult.content[0].text);

      // Find the root category
      const rootCategory = fetchResponse.categories.find((c) => c.id === categories[0].id);
      expect(rootCategory).toBeDefined();
      // console.log('Root category:', {
      //   id: rootCategory?.id,
      //   name: rootCategory?.name,
      //   children_count: rootCategory?.category_children?.length,
      // });

      // Verify the hierarchy depth
      let currentCategory = rootCategory;
      let depth = 0;
      const traversalPath: Array<{ id: string; name: string }> = [];

      while (currentCategory?.category_children?.length) {
        traversalPath.push({
          id: currentCategory.id,
          name: currentCategory.name,
        });
        depth++;
        currentCategory = currentCategory.category_children[0] as typeof currentCategory;
      }
      if (currentCategory) {
        traversalPath.push({
          id: currentCategory.id,
          name: currentCategory.name,
        });
      }

      console.log('Hierarchy traversal:', {
        depth,
        path: traversalPath,
      });

      // We should have created a hierarchy of depth 4 (5 categories, with 4 parent-child relationships)
      expect(depth).toBeGreaterThanOrEqual(4);
    });
  });

  describe('error handling', () => {
    it('should handle invalid pagination values', async () => {
      const client = getClient();
      await expect(
        client.callTool({
          name: 'fetch-categories',
          arguments: {
            limit: -1,
          },
        }),
      ).rejects.toThrow();

      await expect(
        client.callTool({
          name: 'fetch-categories',
          arguments: {
            offset: -1,
          },
        }),
      ).rejects.toThrow();
    });
  });
});

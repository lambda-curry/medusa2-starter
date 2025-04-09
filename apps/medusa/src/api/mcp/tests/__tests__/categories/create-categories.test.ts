import { describe, expect, it } from '@jest/globals';
import { CategoryResult, CreateCategoriesResponse, ErrorResponse } from './types';
import { cleanupCategories, createTestCategory, parseCategoryResponse, expectErrorResponse } from './helpers';
import { useTestClient } from '../../setup';

describe('create-categories tool', () => {
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

  describe('successful creation', () => {
    it('should create a single category', async () => {
      const client = getClient();
      const testCategory = createTestCategory();

      const result = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [testCategory],
        },
      })) as CategoryResult;

      const parsedContent = parseCategoryResponse(result) as CreateCategoriesResponse;
      const category = parsedContent.categories[0];
      testData.categoryIds.push(category.id);

      expect(category.name).toBe(testCategory.name);
      expect(category.handle).toBe(testCategory.handle);
      expect(category.is_internal).toBe(testCategory.is_internal);
      expect(category.is_active).toBe(testCategory.is_active);
      expect(category.parent_category_id).toBeNull();
      expect(parsedContent.message).toContain('Successfully created');
    });

    it('should create multiple categories', async () => {
      const client = getClient();
      const testCategories = [createTestCategory(), createTestCategory()];

      const result = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: testCategories,
        },
      })) as CategoryResult;

      const parsedContent = parseCategoryResponse(result) as CreateCategoriesResponse;
      testData.categoryIds.push(...parsedContent.created_category_ids);

      expect(parsedContent.categories).toHaveLength(2);
      expect(parsedContent.message).toContain('Successfully created 2 categories');
      parsedContent.categories.forEach((category, index) => {
        expect(category.name).toBe(testCategories[index].name);
        expect(category.handle).toBe(testCategories[index].handle);
      });
    });

    it('should create a category with a parent', async () => {
      const client = getClient();
      const parentCategory = createTestCategory();

      const parentResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [parentCategory],
        },
      })) as CategoryResult;

      const parentResponse = parseCategoryResponse(parentResult) as CreateCategoriesResponse;
      const parent = parentResponse.categories[0];
      testData.categoryIds.push(parent.id);

      const childCategory = createTestCategory({ parent_category_id: parent.id });
      const childResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [childCategory],
        },
      })) as CategoryResult;

      const childResponse = parseCategoryResponse(childResult) as CreateCategoriesResponse;
      const child = childResponse.categories[0];
      testData.categoryIds.push(child.id);

      expect(child.parent_category_id).toBe(parent.id);
      expect(childResponse.message).toContain('Successfully created');
    });

    it('should create a category with metadata', async () => {
      const client = getClient();
      const testCategory = createTestCategory({
        metadata: { test: 'value' },
      });

      const result = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [testCategory],
        },
      })) as CategoryResult;

      const parsedContent = parseCategoryResponse(result) as CreateCategoriesResponse;
      testData.categoryIds.push(parsedContent.categories[0].id);

      expect(parsedContent.categories[0].metadata).toEqual({ test: 'value' });
      expect(parsedContent.message).toContain('Successfully created');
    });
  });

  describe('validation', () => {
    it('should validate required fields', async () => {
      const client = getClient();

      await expect(
        client.callTool({
          name: 'create-categories',
          arguments: {
            categories: [{}],
          },
        }),
      ).rejects.toThrow(/Invalid arguments.*create-categories/i);
    });

    it('should prevent duplicate handles', async () => {
      const client = getClient();
      const testCategory = createTestCategory({ parent_category_id: undefined });

      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [testCategory],
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      testData.categoryIds.push(createResponse.categories[0].id);

      await expectErrorResponse(
        client.callTool({
          name: 'create-categories',
          arguments: {
            categories: [{ ...testCategory, id: undefined }],
          },
        }),
        /already exists/i,
      );
    });

    it('should validate parent category reference', async () => {
      const client = getClient();
      const testCategory = createTestCategory({
        parent_category_id: 'invalid-parent-id',
      });

      await expectErrorResponse(
        client.callTool({
          name: 'create-categories',
          arguments: {
            categories: [testCategory],
          },
        }),
        /not found/i,
      );
    });
  });

  describe('error handling', () => {
    it('should handle invalid parent category id', async () => {
      const client = getClient();
      const invalidParentId = 'invalid-id';

      const result = await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory({ parent_category_id: invalidParentId })],
        },
      });
      const content = JSON.parse((result as CategoryResult).content[0].text);
      expect(content.error).toBe(true);
      expect(content.details.message).toMatch(/does not exist/i);
    });
  });
});

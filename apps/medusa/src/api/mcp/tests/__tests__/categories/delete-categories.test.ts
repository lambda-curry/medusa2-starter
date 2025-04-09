import { useTestClient } from '../../setup';
import type { ProductCategoryDTO } from '@medusajs/types';
import { createTestCategory, parseCategoryResponse, cleanupCategories } from './helpers';
import type {
  CategoryResult,
  CreateCategoriesResponse,
  DeleteCategoriesResponse,
  FetchCategoriesResponse,
  ErrorResponse,
} from './types';
import { describe, expect, it } from '@jest/globals';

describe('delete-categories tool', () => {
  const { getClient, connectTestClient } = useTestClient();
  let testData: {
    categoryIds: string[];
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
    it('should delete a single category', async () => {
      const client = getClient();
      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory()],
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      const category = createResponse.categories[0];

      const deleteResult = (await client.callTool({
        name: 'delete-categories',
        arguments: {
          category_ids: [category.id],
        },
      })) as CategoryResult;

      const deleteResponse = parseCategoryResponse(deleteResult) as DeleteCategoriesResponse;
      expect(deleteResponse.deleted_categories).toHaveLength(1);
      expect(deleteResponse.deleted_categories[0].id).toBe(category.id);
      expect(deleteResponse.message).toContain('Successfully deleted');

      // Verify category is deleted
      const fetchResult = (await client.callTool({
        name: 'fetch-categories',
        arguments: {
          query: category.name,
        },
      })) as CategoryResult;

      const fetchResponse = parseCategoryResponse(fetchResult) as FetchCategoriesResponse;
      expect(fetchResponse.categories.filter((c) => c.id === category.id)).toHaveLength(0);
    });

    it('should delete multiple categories', async () => {
      const client = getClient();
      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory(), createTestCategory()],
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      const categoryIds = createResponse.categories.map((c) => c.id);

      const deleteResult = (await client.callTool({
        name: 'delete-categories',
        arguments: {
          category_ids: categoryIds,
        },
      })) as CategoryResult;

      const deleteResponse = parseCategoryResponse(deleteResult) as DeleteCategoriesResponse;
      expect(deleteResponse.deleted_categories).toHaveLength(2);
      expect(deleteResponse.deleted_categories.map((c) => c.id).sort()).toEqual(categoryIds.sort());
      expect(deleteResponse.message).toContain('Successfully deleted');

      // Verify categories are deleted
      const fetchResult = (await client.callTool({
        name: 'fetch-categories',
        arguments: {
          query: createResponse.categories[0].name,
        },
      })) as CategoryResult;

      const fetchResponse = parseCategoryResponse(fetchResult) as FetchCategoriesResponse;
      expect(fetchResponse.categories.filter((c) => categoryIds.includes(c.id))).toHaveLength(0);
    });

    it('should delete leaf category in hierarchy', async () => {
      const client = getClient();
      const createParentResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory()],
        },
      })) as CategoryResult;

      const parentResponse = parseCategoryResponse(createParentResult) as CreateCategoriesResponse;
      const parent = parentResponse.categories[0];
      testData.categoryIds.push(parent.id);

      const createChildResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory({ parent_category_id: parent.id })],
        },
      })) as CategoryResult;

      const childResponse = parseCategoryResponse(createChildResult) as CreateCategoriesResponse;
      const child = childResponse.categories[0];

      const deleteResult = (await client.callTool({
        name: 'delete-categories',
        arguments: {
          category_ids: [child.id],
        },
      })) as CategoryResult;

      const deleteResponse = parseCategoryResponse(deleteResult) as DeleteCategoriesResponse;
      expect(deleteResponse.deleted_categories).toHaveLength(1);
      expect(deleteResponse.deleted_categories[0].id).toBe(child.id);
      expect(deleteResponse.message).toContain('Successfully deleted');

      // Verify only child is deleted
      const fetchResult = (await client.callTool({
        name: 'fetch-categories',
        arguments: {
          query: parent.name,
        },
      })) as CategoryResult;

      const fetchResponse = parseCategoryResponse(fetchResult) as FetchCategoriesResponse;
      expect(fetchResponse.categories.find((c) => c.id === parent.id)).toBeTruthy();
      expect(fetchResponse.categories.find((c) => c.id === child.id)).toBeFalsy();
    });

    it('should delete category hierarchy in correct order', async () => {
      const client = getClient();
      const createParentResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory()],
        },
      })) as CategoryResult;

      const parentResponse = parseCategoryResponse(createParentResult) as CreateCategoriesResponse;
      const parent = parentResponse.categories[0];

      const createChildResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory({ parent_category_id: parent.id })],
        },
      })) as CategoryResult;

      const childResponse = parseCategoryResponse(createChildResult) as CreateCategoriesResponse;
      const child = childResponse.categories[0];

      // Delete parent first (should fail)
      const deleteParentResult = (await client.callTool({
        name: 'delete-categories',
        arguments: {
          category_ids: [parent.id],
        },
      })) as CategoryResult;

      const deleteParentContent = JSON.parse(deleteParentResult.content[0].text);
      expect(deleteParentContent.error).toBeDefined();
      expect(deleteParentContent.message).toContain('with category children is not allowed');

      // Delete child first (should succeed)
      const deleteChildResult = (await client.callTool({
        name: 'delete-categories',
        arguments: {
          category_ids: [child.id],
        },
      })) as CategoryResult;

      const deleteChildResponse = parseCategoryResponse(deleteChildResult) as DeleteCategoriesResponse;
      expect(deleteChildResponse.deleted_categories).toHaveLength(1);
      expect(deleteChildResponse.deleted_categories[0].id).toBe(child.id);

      // Now delete parent (should succeed)
      const deleteParentResult2 = (await client.callTool({
        name: 'delete-categories',
        arguments: {
          category_ids: [parent.id],
        },
      })) as CategoryResult;

      const deleteParentResponse2 = parseCategoryResponse(deleteParentResult2) as DeleteCategoriesResponse;
      expect(deleteParentResponse2.deleted_categories).toHaveLength(1);
      expect(deleteParentResponse2.deleted_categories[0].id).toBe(parent.id);

      // Verify both are deleted
      const fetchResult = (await client.callTool({
        name: 'fetch-categories',
        arguments: {
          query: parent.name,
        },
      })) as CategoryResult;

      const fetchResponse = parseCategoryResponse(fetchResult) as FetchCategoriesResponse;
      expect(fetchResponse.categories.find((c) => c.id === parent.id)).toBeFalsy();
      expect(fetchResponse.categories.find((c) => c.id === child.id)).toBeFalsy();
    });
  });

  describe('validation', () => {
    it('should validate category ids', async () => {
      const client = getClient();
      const result = (await client.callTool({
        name: 'delete-categories',
        arguments: {
          category_ids: [],
        },
      })) as CategoryResult;

      const response = parseCategoryResponse(result) as DeleteCategoriesResponse;
      expect(response.deleted_categories).toHaveLength(0);
      expect(response.message).toBe('No categories were deleted');
    });

    it('should prevent deleting parent with children', async () => {
      const client = getClient();
      const testData = { categoryIds: [] as string[] };

      // Create parent category
      const createParentResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory()],
        },
      })) as CategoryResult;

      const createParentResponse = parseCategoryResponse(createParentResult) as CreateCategoriesResponse;
      testData.categoryIds.push(createParentResponse.created_category_ids[0]);

      // Create child category
      const createChildResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [
            createTestCategory({
              parent_category_id: createParentResponse.created_category_ids[0],
            }),
          ],
        },
      })) as CategoryResult;

      const createChildResponse = parseCategoryResponse(createChildResult) as CreateCategoriesResponse;
      testData.categoryIds.push(createChildResponse.created_category_ids[0]);

      // Attempt to delete parent category
      const deleteResult = (await client.callTool({
        name: 'delete-categories',
        arguments: {
          category_ids: [createParentResponse.created_category_ids[0]],
        },
      })) as CategoryResult;

      const content = JSON.parse(deleteResult.content[0].text);
      expect(content.error).toBeDefined();
      expect(content.message).toContain('with category children is not allowed');

      // Cleanup
      await cleanupCategories(client, testData.categoryIds);
    });
  });

  describe('error handling', () => {
    it('should handle non-existent category ids', async () => {
      const client = getClient();
      const result = (await client.callTool({
        name: 'delete-categories',
        arguments: {
          category_ids: ['non-existent-id'],
        },
      })) as CategoryResult;

      const content = JSON.parse(result.content[0].text);
      expect(content.error).toBeDefined();
      expect(content.message).toContain('was not found');
    });

    it('should handle mixed valid and invalid ids', async () => {
      const client = getClient();
      const testData = { categoryIds: [] as string[] };

      // Create a valid category
      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory()],
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      testData.categoryIds.push(createResponse.created_category_ids[0]);

      // Try to delete both valid and invalid categories
      const result = (await client.callTool({
        name: 'delete-categories',
        arguments: {
          category_ids: [createResponse.created_category_ids[0], 'non-existent-id'],
        },
      })) as CategoryResult;

      const content = JSON.parse(result.content[0].text);
      expect(content.error).toBeDefined();
      expect(content.message).toContain('was not found');

      // Cleanup
      await cleanupCategories(client, testData.categoryIds);
    });
  });
});

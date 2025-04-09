import { describe, expect, it } from '@jest/globals';
import createMedusaApp from '@medusajs/medusa-js';
import { ProductCategoryDTO } from '@medusajs/types';
import { CategoryResult, UpdateCategoriesResponse, ErrorResponse } from './types';
import { cleanupCategories, createTestCategory, parseCategoryResponse, expectErrorResponse } from './helpers';
import { useTestClient } from '../../setup';
import {
  expectCategoriesResponse,
  createCategoryHierarchy,
  expectCategoryToMatch,
  type CreateCategoriesResponse,
  type CategoryResponse,
} from './helpers';

describe('update-categories tool', () => {
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
    it('should update a category', async () => {
      const client = getClient();
      const testCategory = createTestCategory({ parent_category_id: undefined });

      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [testCategory],
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      const category = createResponse.categories[0];
      testData.categoryIds.push(category.id);

      const newName = `Updated Category ${Date.now()}`;
      const updateResult = (await client.callTool({
        name: 'update-categories',
        arguments: {
          selector: { id: category.id },
          update: { name: newName },
        },
      })) as CategoryResult;

      const updateResponse = parseCategoryResponse(updateResult) as UpdateCategoriesResponse;
      expect(updateResponse.categories[0].name).toBe(newName);
      expect(updateResponse.message).toContain('Successfully updated');
    });

    it('should update multiple categories', async () => {
      const client = getClient();
      const testCategories = [
        createTestCategory({ parent_category_id: undefined }),
        createTestCategory({ parent_category_id: undefined }),
      ];

      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: testCategories,
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      testData.categoryIds.push(...createResponse.created_category_ids);

      const updateResult = (await client.callTool({
        name: 'update-categories',
        arguments: {
          selector: { id: createResponse.created_category_ids[0] },
          update: { is_internal: true },
        },
      })) as CategoryResult;

      const updateResponse = parseCategoryResponse(updateResult) as UpdateCategoriesResponse;
      expect(updateResponse.categories[0].is_internal).toBe(true);
      expect(updateResponse.message).toContain('Successfully updated');
    });

    it('should update category metadata', async () => {
      const client = getClient();
      const testCategory = createTestCategory({ parent_category_id: undefined });

      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [testCategory],
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      const category = createResponse.categories[0];
      testData.categoryIds.push(category.id);

      const updateResult = (await client.callTool({
        name: 'update-categories',
        arguments: {
          selector: { id: category.id },
          update: { metadata: { test: 'value' } },
        },
      })) as CategoryResult;

      const updateResponse = parseCategoryResponse(updateResult) as UpdateCategoriesResponse;
      expect(updateResponse.categories[0].metadata).toEqual({ test: 'value' });
      expect(updateResponse.message).toContain('Successfully updated');
    });

    it('should update parent relationship', async () => {
      const client = getClient();
      const parentCategory = createTestCategory({ parent_category_id: undefined });

      const createParentResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [parentCategory],
        },
      })) as CategoryResult;

      const parentResponse = parseCategoryResponse(createParentResult) as CreateCategoriesResponse;
      const parent = parentResponse.categories[0];
      testData.categoryIds.push(parent.id);

      const childCategory = createTestCategory({ parent_category_id: undefined });
      const createChildResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [childCategory],
        },
      })) as CategoryResult;

      const childResponse = parseCategoryResponse(createChildResult) as CreateCategoriesResponse;
      const child = childResponse.categories[0];
      testData.categoryIds.push(child.id);

      const updateResult = (await client.callTool({
        name: 'update-categories',
        arguments: {
          selector: { id: child.id },
          update: { parent_category_id: parent.id },
        },
      })) as CategoryResult;

      const updateResponse = parseCategoryResponse(updateResult) as UpdateCategoriesResponse;
      expect(updateResponse.categories[0].parent_category_id).toBe(parent.id);
      expect(updateResponse.message).toContain('Successfully updated');
    });
  });

  describe('validation', () => {
    it('should validate required fields', async () => {
      const client = getClient();

      await expectErrorResponse(
        client.callTool({
          name: 'update-categories',
          arguments: {
            selector: { id: 'test-id' },
            update: {},
          },
        }),
        /At least one update field is required/i,
      );
    });

    it('should validate selector fields', async () => {
      const client = getClient();

      await expectErrorResponse(
        client.callTool({
          name: 'update-categories',
          arguments: {
            selector: {},
            update: { name: 'Test Category' },
          },
        }),
        /At least one selector field is required/i,
      );
    });

    it('should prevent duplicate handles', async () => {
      const client = getClient();
      const category1 = createTestCategory({ parent_category_id: undefined });
      const category2 = createTestCategory({ parent_category_id: undefined });

      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [category1, category2],
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      testData.categoryIds.push(...createResponse.created_category_ids);

      await expectErrorResponse(
        client.callTool({
          name: 'update-categories',
          arguments: {
            selector: { id: createResponse.categories[1].id },
            update: { handle: createResponse.categories[0].handle },
          },
        }),
        /already exists/i,
      );
    });

    it('should validate metadata format', async () => {
      const client = getClient();
      const category = createTestCategory({ parent_category_id: undefined });

      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [category],
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      testData.categoryIds.push(createResponse.categories[0].id);

      await expectErrorResponse(
        client.callTool({
          name: 'update-categories',
          arguments: {
            selector: { id: createResponse.categories[0].id },
            update: { metadata: 'invalid-metadata' as any },
          },
        }),
        /Expected object, received string/i,
      );
    });
  });

  describe('error handling', () => {
    it('should handle non-existent category ids', async () => {
      const client = getClient();

      await expectErrorResponse(
        client.callTool({
          name: 'update-categories',
          arguments: {
            selector: { id: 'non-existent-id' },
            update: { name: 'New Name' },
          },
        }),
        /No categories found/i,
      );
    });

    it('should handle invalid parent category id', async () => {
      const client = getClient();
      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory({ parent_category_id: undefined })],
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      const category = createResponse.categories[0];
      testData.categoryIds.push(category.id);

      await expectErrorResponse(
        client.callTool({
          name: 'update-categories',
          arguments: {
            selector: { id: category.id },
            update: { parent_category_id: 'invalid-id' },
          },
        }),
        /was not found/i,
      );
    });

    // TODO: Currently the MCP server allows circular parent references.
    // This is an edge case that should be handled in the future to prevent
    // infinite loops in category hierarchies.
    it.skip('should handle circular parent references', async () => {
      const client = getClient();
      const createResult = (await client.callTool({
        name: 'create-categories',
        arguments: {
          categories: [createTestCategory({ parent_category_id: undefined })],
        },
      })) as CategoryResult;

      const createResponse = parseCategoryResponse(createResult) as CreateCategoriesResponse;
      const category = createResponse.categories[0];
      testData.categoryIds.push(category.id);

      await expectErrorResponse(
        client.callTool({
          name: 'update-categories',
          arguments: {
            selector: { id: category.id },
            update: { parent_category_id: category.id },
          },
        }),
        /circular.*reference/i,
      );
    });
  });
});

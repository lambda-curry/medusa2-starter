import type { ProductCategoryDTO } from '@medusajs/types';
import type { Result } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Response schemas and types
export const CategoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  is_internal: z.boolean(),
  is_active: z.boolean(),
  parent_category_id: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  description: z.string().optional(),
  rank: z.number().optional(),
  parent_category: z.unknown().nullable().optional(),
  category_children: z.array(z.unknown()).optional(),
  products: z.array(z.unknown()).optional(),
  has_parent: z.boolean().optional(),
  children_count: z.number().optional(),
});

// Create categories response
export const CreateCategoriesResponseSchema = z.object({
  categories: z.array(CategoryResponseSchema),
  message: z.string(),
  created_category_ids: z.array(z.string()),
});

// Update categories response
export const UpdateCategoriesResponseSchema = z.object({
  categories: z.array(CategoryResponseSchema),
  message: z.string(),
});

// Delete categories response
export const DeleteCategoriesResponseSchema = z.object({
  deleted_categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      handle: z.string(),
    }),
  ),
  message: z.string(),
});

// Fetch categories response
export const FetchCategoriesResponseSchema = z.object({
  categories: z.array(CategoryResponseSchema),
  count: z.number(),
  pagination: z
    .object({
      offset: z.number(),
      limit: z.number(),
      total: z.number(),
    })
    .optional(),
  hierarchy_info: z
    .object({
      root_categories: z.number(),
      categories_with_children: z.number(),
    })
    .optional(),
  message: z.string().optional(),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.literal(true),
  message: z.string(),
  details: z
    .object({
      name: z.string(),
      message: z.string(),
      stack: z.string().optional(),
      __isMedusaError: z.boolean().optional(),
      type: z.string().optional(),
      date: z.string().optional(),
    })
    .optional(),
  failedArguments: z.unknown().optional(),
});

export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;
export type CreateCategoriesResponse = z.infer<typeof CreateCategoriesResponseSchema>;
export type UpdateCategoriesResponse = z.infer<typeof UpdateCategoriesResponseSchema>;
export type DeleteCategoriesResponse = z.infer<typeof DeleteCategoriesResponseSchema>;
export type FetchCategoriesResponse = z.infer<typeof FetchCategoriesResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export interface CategoryResult extends Result {
  content: Array<{
    text: string;
    type: string;
  }>;
}

// Response type guards
export const isCreateCategoriesResponse = (obj: unknown): obj is CreateCategoriesResponse => {
  try {
    return CreateCategoriesResponseSchema.parse(obj) !== null;
  } catch {
    return false;
  }
};

export const isUpdateCategoriesResponse = (obj: unknown): obj is UpdateCategoriesResponse => {
  try {
    return UpdateCategoriesResponseSchema.parse(obj) !== null;
  } catch {
    return false;
  }
};

export const isDeleteCategoriesResponse = (obj: unknown): obj is DeleteCategoriesResponse => {
  try {
    return DeleteCategoriesResponseSchema.parse(obj) !== null;
  } catch {
    return false;
  }
};

export const isFetchCategoriesResponse = (obj: unknown): obj is FetchCategoriesResponse => {
  try {
    return FetchCategoriesResponseSchema.parse(obj) !== null;
  } catch {
    return false;
  }
};

// Response parsing
export const parseCategoryResponse = (result: CategoryResult): unknown => {
  const content = result.content[0]?.text;
  if (!content) {
    throw new Error('Invalid response format');
  }

  const parsed = JSON.parse(content);
  if (parsed.error) {
    const error = new Error(parsed.message || 'Unknown error');
    Object.assign(error, parsed.details || {});
    throw error;
  }

  return parsed;
};

// Helper to expect an error response
export const expectErrorResponse = async (promise: Promise<unknown>, errorPattern: RegExp) => {
  try {
    const result = (await promise) as CategoryResult;
    const content = JSON.parse(result.content[0].text);
    const parsed = ErrorResponseSchema.safeParse(content);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(content.error).toBe(true);
      expect(content.message).toMatch(errorPattern);
    }
  } catch (err) {
    const error = err as { message: string };
    expect(error.message).toMatch(errorPattern);
  }
};

// Factory pattern with hierarchy support
let testCategoryCounter = 0;
export const createTestCategory = (
  overrides: Partial<ProductCategoryDTO> = {},
  options: { parent?: ProductCategoryDTO } = {},
): Omit<ProductCategoryDTO, 'parent_category_id'> & { parent_category_id?: string | null } => {
  const timestamp = Date.now();
  const uniqueId = testCategoryCounter++;
  const base = {
    id: `test-${timestamp}-${uniqueId}`,
    name: `Test Category ${timestamp}-${uniqueId}`,
    handle: `test-category-${timestamp}-${uniqueId}`,
    is_internal: false,
    is_active: true,
    description: overrides.description ?? `Description for test category ${timestamp}-${uniqueId}`,
    rank: overrides.rank ?? 0,
    parent_category: options.parent ?? null,
    category_children: [],
    products: [],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Only include parent_category_id if it's explicitly set or if there's a parent
  const parentCategoryId =
    overrides.parent_category_id !== undefined ? overrides.parent_category_id : options.parent?.id;

  return {
    ...base,
    ...overrides,
    ...(parentCategoryId !== undefined ? { parent_category_id: parentCategoryId } : {}),
  };
};

// Hierarchy helpers
export const createCategoryHierarchy = async (client: any) => {
  const parentResult = (await client.callTool({
    name: 'create-categories',
    arguments: {
      categories: [createTestCategory()],
    },
  })) as CategoryResult;

  const parentResponse = parseCategoryResponse(parentResult) as CreateCategoriesResponse;
  const parent = parentResponse.categories[0] as ProductCategoryDTO;

  const childResult = (await client.callTool({
    name: 'create-categories',
    arguments: {
      categories: [createTestCategory({}, { parent })],
    },
  })) as CategoryResult;

  const childResponse = parseCategoryResponse(childResult) as CreateCategoriesResponse;
  const child = childResponse.categories[0] as ProductCategoryDTO;

  return {
    parent,
    child,
  };
};

// Cleanup helper
export const cleanupCategories = async (client: any, categoryIds: string[]) => {
  if (!categoryIds?.length) return;

  await client.callTool({
    name: 'delete-categories',
    arguments: {
      category_ids: categoryIds,
    },
  });
};

// Deep hierarchy builder for performance testing
export const buildDeepHierarchy = async (client: any, depth: number) => {
  console.log(`Starting to build hierarchy with depth: ${depth}`);
  const categories: ProductCategoryDTO[] = [];
  let parent: ProductCategoryDTO | undefined;

  for (let i = 0; i < depth; i++) {
    console.log(`\n--- Creating category at depth ${i} ---`);
    console.log(
      'Current parent:',
      parent
        ? {
            id: parent.id,
            name: parent.name,
            parent_category_id: parent.parent_category_id,
          }
        : 'None',
    );

    // Create category with parent relationship only if parent exists
    const categoryToCreate = createTestCategory(
      {
        rank: i,
        ...(parent?.id ? { parent_category_id: parent.id } : {}),
      },
      { parent },
    );

    console.log('Category to create:', {
      name: categoryToCreate.name,
      parent_category_id: categoryToCreate.parent_category_id,
      rank: categoryToCreate.rank,
    });

    const result = (await client.callTool({
      name: 'create-categories',
      arguments: {
        categories: [categoryToCreate],
      },
    })) as CategoryResult;

    const response = parseCategoryResponse(result) as CreateCategoriesResponse;
    const category = response.categories[0] as ProductCategoryDTO;

    // Verify the created category
    console.log('Created category:', {
      id: category.id,
      name: category.name,
      parent_category_id: category.parent_category_id,
      rank: category.rank,
    });

    categories.push(category);
    parent = category;
  }

  // After creating all categories, fetch the root to verify the hierarchy
  if (categories.length > 0) {
    const rootCategory = categories[0];
    console.log('\nFetching root category to verify hierarchy:', rootCategory.name);

    // Fetch with exact name match to ensure we get the right category
    const fetchResult = (await client.callTool({
      name: 'fetch-categories',
      arguments: {
        query: `"${rootCategory.name}"`, // Exact match
        limit: 1, // We only need the root category
      },
    })) as CategoryResult;

    const fetchResponse = parseCategoryResponse(fetchResult) as FetchCategoriesResponse;

    // Log the full hierarchy
    const logHierarchy = (category: any, depth = 0) => {
      console.log(
        `${'  '.repeat(depth)}Category: ${category.name} (${category.id}), Children: ${
          category.category_children?.length ?? 0
        }`,
      );
      category.category_children?.forEach((child: any) => logHierarchy(child, depth + 1));
    };

    if (fetchResponse.categories[0]) {
      console.log('\nHierarchy structure:');
      logHierarchy(fetchResponse.categories[0]);
    }
  }

  console.log('\n=== Final Hierarchy Summary ===');
  categories.forEach((cat, index) => {
    console.log(`Level ${index}:`, {
      id: cat.id,
      name: cat.name,
      parent_category_id: cat.parent_category_id,
    });
  });

  return categories;
};

// Validation helpers
export const expectCategoryToMatch = (category: ProductCategoryDTO, expected: Partial<ProductCategoryDTO>) => {
  Object.entries(expected).forEach(([key, value]) => {
    expect(category[key as keyof ProductCategoryDTO]).toEqual(value);
  });
};

export const expectCategoriesResponse = (result: CategoryResult) => {
  const response = parseCategoryResponse(result) as { categories: unknown[] };
  expect(response).toHaveProperty('categories');
  expect(Array.isArray(response.categories)).toBe(true);
  response.categories.forEach((category: unknown) => {
    expect(CategoryResponseSchema.safeParse(category).success).toBe(true);
  });
  return response;
};

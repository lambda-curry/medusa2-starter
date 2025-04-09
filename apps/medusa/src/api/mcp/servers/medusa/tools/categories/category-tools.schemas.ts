import { z } from 'zod';

// Base schemas
export const categoryBaseSchema = z.object({
  name: z.string().describe('The name of the category'),
  handle: z.string().optional().describe('URL-friendly slug for the category. Will be auto-generated if not provided.'),
  is_internal: z.boolean().optional().default(false).describe('Whether the category is for internal use only'),
  is_active: z.boolean().optional().default(true).describe('Whether the category is visible to customers'),
  parent_category_id: z
    .string()
    .optional()
    .describe('ID of the parent category. If not provided, this will be a root category.'),
  metadata: z
    .record(z.unknown())
    .optional()
    .describe('Additional fields used to add custom attributes to the category'),
});

// Input schemas for specific operations
export const createCategorySchema = z.object({
  categories: z
    .array(categoryBaseSchema)
    .min(1)
    .describe('List of categories to create. At least one category is required.'),
});

export const updateCategorySchema = categoryBaseSchema.extend({
  id: z.string().describe('The ID of the category to update'),
});

export const deleteCategorySchema = z.object({
  id: z.string().describe('The ID of the category to delete'),
  force: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to force delete the category and its children. If false, will fail if category has children.'),
});

// Types
export type CategoryBase = z.infer<typeof categoryBaseSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;

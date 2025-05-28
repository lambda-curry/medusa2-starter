import { z } from 'zod';
import { validateAndTransformBody } from '@medusajs/framework';

const createPostSectionSchema = z.object({
  name: z.string(),
  layout: z.enum(['full_width', 'two_column', 'grid']).default('full_width'),
  sort_order: z.number().optional(),
  blocks: z.any().optional(),
  post_id: z.string().optional(),
  post_template_id: z.string().optional(),
});

const updatePostSectionSchema = createPostSectionSchema.partial();

export const validateCreatePostSection = validateAndTransformBody(createPostSectionSchema);
export const validateUpdatePostSection = validateAndTransformBody(updatePostSectionSchema);

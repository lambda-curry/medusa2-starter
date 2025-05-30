import { z } from 'zod';
import { validateAndTransformBody, type MiddlewareRoute } from '@medusajs/framework';

const reorderSectionsSchema = z.object({
  section_ids: z.array(z.string()),
});

export type ReorderSectionsBody = z.infer<typeof reorderSectionsSchema>;

export const validateReorderSections = validateAndTransformBody(reorderSectionsSchema);

export const adminReorderSectionsRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/content/posts/:id/reorder-sections',
    method: 'POST',
    middlewares: [validateReorderSections],
  },
];

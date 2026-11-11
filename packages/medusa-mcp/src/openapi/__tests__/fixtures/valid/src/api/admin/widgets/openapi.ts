import { z } from '@medusajs/framework/zod';

const Widget = z.looseObject({ id: z.string(), name: z.string(), retired_at: z.string().nullable().optional() });

export default {
  tag: 'Widgets',
  operations: {
    GET: {
      operationId: 'listAdminWidgets',
      summary: 'List widgets',
      query: z.object({ limit: z.coerce.number().int().optional(), q: z.string().optional() }),
      responses: { 200: { description: 'Widgets', schema: z.object({ widgets: z.array(Widget) }) } },
    },
    POST: {
      operationId: 'createAdminWidget',
      summary: 'Create a widget',
      body: z.object({ name: z.string() }),
      responses: { 200: { description: 'Created widget', schema: z.object({ widget: Widget }) } },
    },
  },
};

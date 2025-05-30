import { defineMiddlewares } from '@medusajs/framework';
import { adminPostRoutesMiddlewares } from './admin/content/posts/middlewares';
import { adminPostItemRoutesMiddlewares } from './admin/content/posts/[id]/middlewares';
import { adminSectionRoutesMiddlewares } from './admin/content/sections/middlewares';
import { adminReorderSectionsRoutesMiddlewares } from './admin/content/posts/[id]/reorder-sections/middlewares';

export default defineMiddlewares([
  ...adminPostRoutesMiddlewares,
  ...adminPostItemRoutesMiddlewares,
  ...adminSectionRoutesMiddlewares,
  ...adminReorderSectionsRoutesMiddlewares,
]);

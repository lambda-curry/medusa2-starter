import { defineMiddlewares } from '@medusajs/framework'
import { adminPostRoutesMiddlewares } from './admin/content/posts/middlewares'
import { adminPostItemRoutesMiddlewares } from './admin/content/posts/[id]/middlewares'

export default defineMiddlewares([
  ...adminPostRoutesMiddlewares,
  ...adminPostItemRoutesMiddlewares,
])

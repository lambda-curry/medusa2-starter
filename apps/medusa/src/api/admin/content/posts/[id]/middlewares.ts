import { type MiddlewareRoute, validateAndTransformBody, validateAndTransformQuery } from '@medusajs/framework';
import { updatePostSchema } from '../../validations';
import { defaultAdminPostFields, defaultPostsQueryConfig } from '../middlewares';
import { createFindParams } from '@medusajs/medusa/api/utils/validators';

export const defaultGetPostQueryConfig = {
  defaults: [...defaultAdminPostFields],
  isList: false,
};

export const adminPostItemRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/content/posts/:id',
    method: 'PUT',
    middlewares: [validateAndTransformBody(updatePostSchema)],
  },
  {
    matcher: '/admin/content/posts/:id',
    method: 'GET',
    middlewares: [validateAndTransformQuery(createFindParams({}), defaultGetPostQueryConfig)],
  },
  {
    matcher: '/admin/content/posts/:id',
    method: 'DELETE',
    middlewares: [],
  },
];

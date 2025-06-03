import { model } from '@medusajs/framework/utils';
import { PostModel } from './post';

export const PostAuthorModel = model.define(
  { name: 'post_author', tableName: 'page_builder_post_author' },
  {
    id: model.id({ prefix: 'post_author' }).primaryKey(),
    name: model.text(),

    // relations fields
    medusa_user_id: model.text().unique(),
    posts: model.manyToMany(() => PostModel, {
      mappedBy: 'authors',
    }),
  },
);

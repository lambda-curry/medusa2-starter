import { model } from '@medusajs/framework/utils';
import { PostModel } from './post';

export const PostTagModel = model.define(
  { name: 'post_tag', tableName: 'page_builder_post_tag' },
  {
    id: model.id({ prefix: 'post_tag' }).primaryKey(),
    label: model.text(),
    handle: model.text().unique(),
    description: model.text(),

    // relations fields
    created_by_id: model.text(),
    posts: model.manyToMany(() => PostModel, {
      mappedBy: 'tags',
    }),
  },
);

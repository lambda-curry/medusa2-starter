import { model } from '@medusajs/framework/utils';
import { PostModel } from './post';
import { PostTemplateModel } from './post-template';

export const PostSectionModel = model.define(
  { name: 'post_section', tableName: 'page_builder_post_section' },
  {
    id: model.id({ prefix: 'postsec' }).primaryKey(),
    status: model.enum(['draft', 'published', 'archived']).default('draft'),
    title: model.text(),
    layout: model.enum(['full_width', 'two_column', 'grid']).default('full_width'),
    sort_order: model.number(),
    blocks: model.json(),

    post: model
      .belongsTo(() => PostModel, {
        mappedBy: 'sections',
      })
      .nullable(),
    post_template: model
      .belongsTo(() => PostTemplateModel, {
        mappedBy: 'sections',
      })
      .nullable(),
  },
);

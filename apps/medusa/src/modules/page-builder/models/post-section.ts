import { model } from '@medusajs/framework/utils'
import { PostModel } from './post'
import { PostTemplateModel } from './post-template'

export const PostSectionModel = model.define('post_section', {
  id: model.id({ prefix: 'postsec' }).primaryKey(),
  type: model.enum([
    'button_list',
    'cta',
    'header',
    'hero',
    'product_carousel',
    'product_grid',
    'image_gallery',
    'raw_html',
    'rich_text',
    'blog_list',
  ]),
  status: model.enum(['draft', 'published', 'archived']).default('draft'),
  name: model.text(),
  content: model.json(),
  settings: model.json(),
  styles: model.json().nullable(),
  is_reusable: model.boolean().default(false),
  usage_count: model.number().default(1),
  sort_order: model.number(),

  // relations fields
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
})

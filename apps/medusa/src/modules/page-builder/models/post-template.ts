import { model } from '@medusajs/framework/utils'
import { PostSectionModel } from './post-section'

export const PostTemplateModel = model.define('post_template', {
  id: model.id({ prefix: 'post_temp' }).primaryKey(),
  title: model.text(),
  status: model.enum(['draft', 'published', 'archived']).default('draft'),
  type: model.enum(['page', 'post']),
  description: model.text().nullable(),
  sort_order: model.number().default(0),

  // relations fields
  sections: model.hasMany(() => PostSectionModel),
})

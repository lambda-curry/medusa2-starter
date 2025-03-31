import { model } from '@medusajs/framework/utils'
import { PostModel } from './post'
import { SiteSettingsModel } from './site-settings'

export const ImageModel = model
  .define('image', {
    id: model.id({ prefix: 'img' }).primaryKey(),
    url: model.text(),
    metadata: model.json().nullable(),

    // relations fields
    post: model
      .belongsTo(() => PostModel, {
        mappedBy: 'featured_image',
      })
      .nullable(),
    site_settings: model
      .belongsTo(() => SiteSettingsModel, {
        mappedBy: 'favicon',
      })
      .nullable(),
  })
  .indexes([
    {
      name: 'IDX_product_image_url',
      on: ['url'],
      unique: false,
      where: 'deleted_at IS NULL',
    },
  ])

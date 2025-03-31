import { model } from '@medusajs/framework/utils'
import { ImageModel } from './image'

export const SiteSettingsModel = model.define('site_settings', {
  id: model.id({ prefix: 'site_sett' }).primaryKey(),
  description: model.text().nullable(),
  header_code: model.text().nullable(),
  footer_code: model.text().nullable(),
  storefront_url: model.text().nullable(),
  primary_theme_colors: model.json().nullable(),
  accent_theme_colors: model.json().nullable(),
  highlight_theme_colors: model.json().nullable(),
  display_font: model.json().nullable(),
  body_font: model.json().nullable(),
  include_site_name_beside_logo: model.boolean(),
  social_instagram: model.text().nullable(),
  social_youtube: model.text().nullable(),
  social_facebook: model.text().nullable(),
  social_twitter: model.text().nullable(),
  social_linkedin: model.text().nullable(),
  social_pinterest: model.text().nullable(),
  social_tiktok: model.text().nullable(),
  social_snapchat: model.text().nullable(),
  global_css: model.text().nullable(),
  ga_property_id: model.text().nullable(),
  shipping_sort: model.text().nullable(),

  // relations
  favicon: model.hasOne(() => ImageModel, {
    mappedBy: 'site_settings',
  }),
})

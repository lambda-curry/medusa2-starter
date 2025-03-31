import { model } from '@medusajs/framework/utils'

export const NavigationItemModel = model.define('navigation_item', {
  id: model.id({ prefix: 'nav_item' }).primaryKey(),
  label: model.text(),
  location: model.enum(['header', 'footer']),
  url: model.text(),
  new_tab: model.boolean().default(false),
  sort_order: model.number().default(0),
})

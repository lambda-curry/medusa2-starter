import { defineLink } from '@medusajs/framework/utils'
import UserModule from '@medusajs/medusa/user'
import PageBuilderModule from '../modules/page-builder'

export default defineLink(
  {
    ...PageBuilderModule.linkable.postTag.id,
    field: 'created_by_id',
  },
  UserModule.linkable.user,
  {
    readOnly: true,
  },
)

import { defineLink } from '@medusajs/framework/utils'
import UserModule from '@medusajs/medusa/user'
import PageBuilderModule from '../modules/page-builder'

export default defineLink(
  {
    ...PageBuilderModule.linkable.postAuthor.id,
    field: 'medusa_user_id',
  },
  UserModule.linkable.user,
  {
    readOnly: true,
  },
)

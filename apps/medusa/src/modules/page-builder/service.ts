import { MedusaService } from '@medusajs/framework/utils'
import {
  PostAuthorModel,
  PostModel,
  PostTemplateModel,
  PostTagModel,
  PostSectionModel,
  ImageModel,
  SiteSettingsModel,
  NavigationItemModel,
} from './models'

class PageBuilderService extends MedusaService({
  PostAuthor: PostAuthorModel,
  Post: PostModel,
  PostTemplate: PostTemplateModel,
  PostTag: PostTagModel,
  PostSection: PostSectionModel,
  Image: ImageModel,
  SiteSettings: SiteSettingsModel,
  NavigationItem: NavigationItemModel,
}) {}

export default PageBuilderService

// import type {
//   Address as MedusaAddress,
//   Cart as MedusaCart,
//   Customer as MedusaCustomer,
//   Discount as MedusaDiscount,
//   Image as MedusaImage,
//   LineItem as MedusaLineItem,
//   Order as MedusaOrder,
//   PaymentSession as MedusaPaymentSession,
//   Product as MedusaProduct,
//   ProductCategory as MedusaProductCategory,
//   ProductCollection as MedusaProductCollection,
//   ProductOption as MedusaProductOption,
//   ProductOptionValue as MedusaProductOptionValue,
//   ProductTag as MedusaProductTag,
//   ProductType as MedusaProductType,
//   ProductVariant as MedusaProductVariant,
//   Region as MedusaRegion,
//   Store as MedusaStore,
//   User as MedusaUser,
//   StoreGetProductsParams,
// } from "@markethaus/storefront-client"
// import type { DateComparisonOperator } from "@medusajs/medusa/dist/types/common"
// import type {
//   PricedProduct as MedusaPricedProduct,
//   PricedVariant as MedusaPricedVariant,
// } from "@markethaus/storefront-client"
import { Image } from '@medusajs/medusa'
import type { LanguageCode } from './languages'
import {
  BaseAddress,
  HttpTypes,
  StoreCollection,
  StoreCustomer,
  StoreDTO,
  StoreProductCategory,
  StoreProductTag,
  StoreProductType,
  UserDTO,
} from '@medusajs/types'
import {
  PostSectionType,
  ProductCarouselPostSection,
  ProductGridPostSection,
} from '@libs/utils-to-merge/medusa'
import { BaseRegionCountry } from '@medusajs/types/dist/http/region/common'

// export type MedusaClientSerialized<T> = T
// export type PricedProduct = MedusaClientSerialized<MedusaPricedProduct>
// export type PricedVariant = MedusaClientSerialized<MedusaPricedVariant>
// export type User = MedusaClientSerialized<Omit<MedusaUser, "beforeInsert">>
// export type Order = MedusaClientSerialized<MedusaOrder>
// export type Product = MedusaClientSerialized<MedusaProduct>
// export type Cart = MedusaClientSerialized<MedusaCart>
// export type ProductCollection = MedusaClientSerialized<MedusaProductCollection>
// export type ProductCategory = MedusaClientSerialized<MedusaProductCategory>
// export type ProductOption = MedusaClientSerialized<MedusaProductOption>
// export type ProductOptionValue =
//   MedusaClientSerialized<MedusaProductOptionValue>
// export type Customer = Omit<
//   MedusaClientSerialized<MedusaCustomer>,
//   "password_hash" | "orders"
// >
// export type Address = MedusaClientSerialized<MedusaAddress>
// export type Image = MedusaClientSerialized<MedusaImage>
// export type LineItem = MedusaClientSerialized<MedusaLineItem>
// export type ProductVariant = MedusaClientSerialized<MedusaProductVariant>
// export type ProductTag = MedusaClientSerialized<MedusaProductTag>
// export type ProductType = MedusaClientSerialized<MedusaProductType>
// export type PaymentSession = MedusaClientSerialized<MedusaPaymentSession>
// // export type Vendor = MedusaClientSerialized<Omit<MedusaVendor, 'products' | 'balance'>>;
// export type Region = MedusaClientSerialized<MedusaRegion>
// export type Discount = MedusaClientSerialized<MedusaDiscount>

export interface StyleColor {
  DEFAULT: string
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

export interface Font {
  family: string
  variants: string[]
  subsets: string[]
  version: string
  lastModified: string
  files: Record<string, string>
  category: string
  kind: string
}

export interface StoreCustomerPaymentMethodsDeleteRes {
  customer: StoreCustomer
}

export enum NavigationItemLocation {
  header = 'header',
  footer = 'footer',
}

export interface NavigationItem {
  id: number
  label: string
  url: string
  new_tab: boolean
  location: NavigationItemLocation
  sort_order: number
}

export type NavigationCollection = NavigationItem[]

export interface SiteDetailsRootData {
  store: StoreDTO
  settings: SiteSettings
  headerNavigationItems: NavigationCollection
  footerNavigationItems: NavigationCollection
}

export interface ContentBlockTunes {
  textAlign: {
    alignment: 'left' | 'center' | 'right'
  }
}

export enum ContentBlockTypes {
  header = 'header',
  paragraph = 'paragraph',
  image = 'image',
  nestedList = 'nestedList',
  linkTool = 'linkTool',
  code = 'code',
  quote = 'quote',
  delimiter = 'delimiter',
  table = 'table',
  raw = 'raw',
}

export interface BaseContentBlock {
  id: string
  tunes: ContentBlockTunes
  type: ContentBlockTypes
}

export interface HeaderContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.header
  data: {
    level: number
    text: string
  }
}

export interface ParagraphContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.paragraph
  data: {
    text: string
  }
}

export interface ImageContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.image
  data: {
    caption: string
    file: {
      url: string
    }
    stretched: boolean
    withBackground: boolean
    withBorder: boolean
  }
}

export type NestedListItems = { content: string; items: NestedListItems }[]

export interface ListContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.nestedList
  data: {
    style: 'ordered' | 'unordered'
    items: NestedListItems
  }
}

export interface LinkToolContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.linkTool
  data: {
    link: string
    meta: {
      title: string
      description: string
      image: {
        url: string
      }
    }
  }
}

export interface CodeContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.code
  data: {
    code: string
  }
}

export interface QuoteContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.quote
  data: {
    text: string
    caption: string
    alignment: string
  }
}

export interface DelimiterContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.delimiter
  data: Record<never, never>
}

export interface TableContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.table
  data: {
    withHeadings: boolean
    content: string[][]
  }
}

export interface RawContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.raw
  data: {
    html: string
  }
}

export type ContentBlock =
  | HeaderContentBlock
  | ParagraphContentBlock
  | ImageContentBlock
  | ListContentBlock
  | LinkToolContentBlock
  | CodeContentBlock
  | QuoteContentBlock
  | DelimiterContentBlock
  | TableContentBlock
  | RawContentBlock

export enum PageType {
  POST = 'post',
  PAGE = 'page',
  PRODUCT = 'product',
  REVISION = 'revision',
}

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum PageContentMode {
  BASIC = 'basic',
  ADVANCED = 'advanced',
}

export interface PageTag {
  id: string
  label: string
  handle: string
  created_by_id?: string
  created_at: string
  updated_at: string
}

export interface PageTagsResponse {
  page_tags: PageTag[]
  count: number
}

export interface RichTextContentValue {
  blocks: ContentBlock[]
  time: number
  version: string
}

export interface SeoDetails {
  title?: string
  description?: string
  image?: ImageField
}

export interface Page {
  id: string
  title?: string
  sections: BasePageSection[]
  handle: string
  seo?: SeoDetails
}

export interface PageTemplate {
  id: string
  isTemplate?: boolean
  content_mode: PageContentMode.ADVANCED
  type: PageType
  title?: string
  sections: BasePageSection[]
  sort_order: number
  status: PageStatus
  last_updated_by_id?: string
  last_updated_by?: UserDTO
  created_at: string
  updated_at: string
  archived_at?: Date
  product_id?: string
  vendor_id?: string
  seo: never
}

export enum PageSectionType {
  BUTTON_LIST = 'button_list',
  CTA = 'cta',
  HEADER = 'header',
  HERO = 'hero',
  PRODUCT_CAROUSEL = 'product_carousel',
  PRODUCT_GRID = 'product_grid',
  IMAGE_GALLERY = 'image_gallery',
  RAW_HTML = 'raw_html',
  RICH_TEXT = 'rich_text',
  BLOG_LIST = 'blog_list',
}

export enum PageSectionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ButtonStyleVariant {
  DEFAULT = 'default',
  PRIMARY = 'primary',
  LINK = 'link',
}

export interface TranslatableField {
  value: string
  translations?: {
    [key in LanguageCode]?: string
  }
}

export interface TranslatableRichTextField {
  value: RichTextContentValue
  translations?: {
    [key in LanguageCode]: RichTextContentValue
  }
}

export interface CustomAction {
  label: string
  url: string
  new_tab?: boolean
  style_variant?: ButtonStyleVariant
}

export interface ImageField {
  id?: string
  url?: string
  alt?: string
  href?: string
  width?: number
  height?: number
}

export interface ResponsiveImageField {
  default?: ImageField
  mobile?: ImageField
}

export enum ThemeColor {
  PRIMARY = 'primary',
  ACCENT = 'accent',
  HIGHLIGHT = 'highlight',
  GRAY = 'gray',
  BLACK = 'black',
  WHITE = 'white',
}

export enum FontWeight {
  DEFAULT = 'default',
  THIN = '100',
  EXTRA_LIGHT = '200',
  LIGHT = '300',
  NORMAL = '400',
  MEDIUM = '500',
  SEMI_BOLD = '600',
  BOLD = '700',
  EXTRA_BOLD = '800',
  BLACK = '900',
}

export enum BackgroundPosition {
  TOP_LEFT = 'top left',
  TOP = 'top',
  TOP_RIGHT = 'top right',
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  BOTTOM_LEFT = 'bottom left',
  BOTTOM = 'bottom',
  BOTTOM_RIGHT = 'bottom right',
}

export enum BackgroundSize {
  AUTO = 'auto',
  COVER = 'cover',
  CONTAIN = 'contain',
}

export enum BackgroundRepeat {
  NO_REPEAT = 'no-repeat',
  REPEAT = 'repeat',
  REPEAT_X = 'repeat-x',
  REPEAT_Y = 'repeat-y',
  SPACE = 'space',
  ROUND = 'round',
}

export enum TextAlign {
  AUTO = 'auto',
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

export interface ThumbnailImage {
  url?: string
  alt?: TranslatableField
}

export enum BackgroundType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface Video {
  url?: string
  loop?: boolean
  thumbnail?: ThumbnailImage
}

export interface BackgroundOverlay {
  color?: string
  opacity?: number
  blur?: number
  blend_mode?: string
}

export interface Spacing {
  top?: string
  right?: string
  bottom?: string
  left?: string
}

export interface BaseStyles {
  background_type?: BackgroundType
  background_image?: ImageField
  background_color?: string
  background_position?: BackgroundPosition | string
  background_size?: BackgroundSize | string
  background_repeat?: BackgroundRepeat | string
  background_video?: Video
  background_overlay?: BackgroundOverlay
  color?: string
  text_align?: TextAlign
  font_family?: string
  font_size?: string
  font_weight?: FontWeight
  padding?: Spacing
  margin?: Spacing
  custom_css?: string
}

export interface BasePageSectionStyles {
  // TODO: Still needed
  default?: BaseStyles
  mobile?: BaseStyles
}

export interface ProductListFilter {
  q?: string
  collection_id?: string[]
  tags?: string[]
  category_id?: string[]
  limit?: number
  order?: string
}

export type ImageGalleryLayout =
  | 'rows'
  | 'columns'
  | 'masonry'
  | 'rows-full-width'
  | 'columns-full-width'
  | 'masonry-full-width'

export interface ImageGalleryContent extends BasePageSectionContent {
  gallery?: ImageField[]
  layout?: ImageGalleryLayout
  spacing?: number
  columns?: number
}

export interface BasePageSectionContent {
  heading?: TranslatableField
  text?: TranslatableRichTextField
  actions?: CustomAction[]
}

export interface HeroContent extends BasePageSectionContent {
  image?: ImageField
  backgroundType: BackgroundType
  videoURL?: string
  thumbnail?: ThumbnailImage
}

export interface ProductListContent extends BasePageSectionContent {
  filters?: ProductListFilter
}

export interface RawHTMLContent extends BasePageSectionContent {
  html: TranslatableField
}

export interface RichTextContent extends BasePageSectionContent {
  text: TranslatableRichTextField
}

export interface BasePageSection<
  TContent extends BasePageSectionContent = BasePageSectionContent,
> {
  id: string
  type: PageSectionType
  content: TContent
}

export interface ButtonListPageSection extends BasePageSection {
  type: PageSectionType.BUTTON_LIST
}

export interface CTAPageSection extends BasePageSection {
  type: PageSectionType.CTA
}

export interface HeaderPageSection extends BasePageSection {
  type: PageSectionType.HEADER
}

export interface HeroPageSection extends BasePageSection<HeroContent> {
  type: PageSectionType.HERO
}

export interface BlogListPageSection extends BasePageSection {
  type: PageSectionType.BLOG_LIST
}

export interface ImageGalleryPageSection
  extends BasePageSection<ImageGalleryContent> {
  type: PageSectionType.IMAGE_GALLERY
}

export interface RawHTMLPageSection extends BasePageSection<RawHTMLContent> {
  type: PageSectionType.RAW_HTML
}

export interface RichTextPageSection extends BasePageSection<RichTextContent> {
  type: PageSectionType.RICH_TEXT
}

export interface ProductCarouselPageSection
  extends BasePageSection<ProductListContent> {
  type: PageSectionType.PRODUCT_CAROUSEL
}

export interface ProductGridPageSection
  extends BasePageSection<ProductListContent> {
  type: PageSectionType.PRODUCT_GRID
}

export type PageSection =
  | ButtonListPageSection
  | CTAPageSection
  | HeaderPageSection
  | HeroPageSection
  | ImageGalleryPageSection
  | RawHTMLPageSection
  | RichTextPageSection
  | BlogListPageSection
  | ProductCarouselPageSection
  | ProductGridPageSection

export interface CreateNewsletterSubscriberReq {
  email: string
}

export interface NewsletterSubscriberRes {
  success: boolean
  message: string
}

export interface SiteSettings {
  description?: string
  favicon: string
  display_font?: Font
  body_font?: Font
  include_site_name_beside_logo?: boolean
  social_instagram?: string
  social_youtube?: string
  social_facebook?: string
  social_twitter?: string
  social_linkedin?: string
  social_pinterest?: string
  social_tiktok?: string
  social_snapchat?: string
  storefront_url?: string
}

export interface Address {
  firstName: string
  lastName: string
  company?: string | null
  address1: string
  address2?: string | null
  city: string
  province: string
  countryCode: string
  postalCode: string
  phone?: string | null
  country?: string | null // BaseRegionCountry["iso_2"]
}

export type MedusaAddress = Omit<BaseAddress, 'id' | 'customer_id'>

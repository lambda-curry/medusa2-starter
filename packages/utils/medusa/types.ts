import type {
  Customer,
  Region,
  Image,
  ProductCollection,
  ProductTag,
  ProductType,
  Store as MedusaStore,
  StoreGetProductsParams,
  User,
  Product,
  ProductVariant,
  ProductCategory
} from '@medusajs/medusa';
import type { DateComparisonOperator } from '@medusajs/medusa/dist/types/common';
import type { LanguageCode } from './languages';
import type { PricedProduct, PricedVariant } from '@medusajs/medusa/dist/types/pricing';

export interface Vendor {
  id: string;
  name: string;
  handle?: string;
  description?: string;
  email?: string;
  email_cc?: string;
  return_policy?: string;
  logo_id?: string;
  logo?: Image;
  location?: string;
  // status: string;
  created_at: string;
  updated_at: string;
}

export interface StyleColor {
  DEFAULT: string;
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface Font {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: Record<string, string>;
  category: string;
  kind: string;
}

export interface StoreGetVendorsParams {
  id?: string | string[];
  q?: string;
  name?: string;
  handle?: string;
  limit?: number;
  offset?: number;
  created_at?: DateComparisonOperator;
  updated_at?: DateComparisonOperator;
}

export interface StoreVendorsListRes {
  vendors: Vendor[];
  count: number;
}

export interface StoreVendorRetrieveRes {
  vendor: Vendor;
}

export interface StorePostVendorsContactReq {
  customer_email: string;
  customer_name: string;
  subject: string;
  message: string;
}

export interface StoreVendorsContactRes {
  success: boolean;
  message: string;
}

export interface StoreCustomerPaymentMethodsDeleteRes {
  customer: Customer;
}

export interface CreateProductReviewReq {
  __rvfInternalFormId?: any;
  product_id: string;
  product_variant_id?: string;
  content?: string;
  rating: number;
  images?: (Express.Multer.File | string)[];
  review_request_id?: string;
}

export interface EditProductReviewReq extends CreateProductReviewReq {
  id: string;
}
export interface CreateProductReviewRes {
  review: ProductReview;
}

export interface UpdateProductReviewReq {
  id: string;
  product_id: string;
  product_variant_id?: string;
  content?: string;
  rating: number;
  images?: (Express.Multer.File | string)[];
  images_keep?: string[];
  review_request_id?: string;
}

export interface DeleteProductReviewRes {
  success: boolean;
  message: string;
}

export interface SiteSettings {
  id: string;
  ga_property_id?: string;
  global_css?: string;
  header_code?: string;
  footer_code?: string;
  description?: string;
  favicon_id?: string;
  favicon?: Image;
  primary_theme_colors?: StyleColor;
  accent_theme_colors?: StyleColor;
  highlight_theme_colors?: StyleColor;
  display_font?: Font;
  body_font?: Font;
  include_site_name_beside_logo?: boolean;
  social_instagram?: string;
  social_youtube?: string;
  social_facebook?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_pinterest?: string;
  social_tiktok?: string;
  social_snapchat?: string;
  storefront_url?: string;
}

export enum NavigationItemLocation {
  header = 'header',
  footer = 'footer'
}

export interface NavigationItem {
  id: number;
  label: string;
  url: string;
  new_tab: boolean;
  location: NavigationItemLocation;
  sort_order: number;
}

export type NavigationCollection = NavigationItem[];

export interface Store extends MedusaStore {
  type: 'enterprise' | 'whitelabel' | 'markethaus';
}

export interface SiteSettingsRes {
  store: Store;
  feature_flags: { key: string; value: boolean }[];
  site_settings: SiteSettings;
  navigation_items: NavigationCollection;
}

export interface SiteDetailsRootData {
  store: Store;
  site_settings: SiteSettings;
  feature_flags: { key: string; value: boolean }[];
  header_navigation_items: NavigationCollection;
  footer_navigation_items: NavigationCollection;
}

export interface ContentBlockTunes {
  textAlign: {
    alignment: 'left' | 'center' | 'right';
  };
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
  raw = 'raw'
}

export interface ProductWithReviews extends Omit<PricedProduct, 'variants'> {
  reviewStats: ProductReviewStats;
  variants: PricedVariant[];
}

export interface ProductReviewStats {
  product_id: string;
  count: number;
  average: number;
  by_rating: {
    count: number;
    rating: number;
  }[];
}

export interface BaseContentBlock {
  id: string;
  tunes: ContentBlockTunes;
  type: ContentBlockTypes;
}

export interface HeaderContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.header;
  data: {
    level: number;
    text: string;
  };
}

export interface ParagraphContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.paragraph;
  data: {
    text: string;
  };
}

export interface ImageContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.image;
  data: {
    caption: string;
    file: {
      url: string;
    };
    stretched: boolean;
    withBackground: boolean;
    withBorder: boolean;
  };
}

export type NestedListItems = { content: string; items: NestedListItems }[];

export interface ListContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.nestedList;
  data: {
    style: 'ordered' | 'unordered';
    items: NestedListItems;
  };
}

export interface LinkToolContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.linkTool;
  data: {
    link: string;
    meta: {
      title: string;
      description: string;
      image: {
        url: string;
      };
    };
  };
}

export interface CodeContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.code;
  data: {
    code: string;
  };
}

export interface QuoteContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.quote;
  data: {
    text: string;
    caption: string;
    alignment: string;
  };
}

export interface DelimiterContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.delimiter;
  data: Record<never, never>;
}

export interface TableContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.table;
  data: {
    withHeadings: boolean;
    content: string[][];
  };
}

export interface RawContentBlock extends BaseContentBlock {
  type: ContentBlockTypes.raw;
  data: {
    html: string;
  };
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
  | RawContentBlock;

export enum PostType {
  POST = 'post',
  PAGE = 'page',
  PRODUCT = 'product',
  VENDOR = 'vendor',
  REVISION = 'revision'
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum PostContentMode {
  BASIC = 'basic',
  ADVANCED = 'advanced'
}

export interface PostTag {
  id: string;
  label: string;
  handle: string;
  created_by_id?: string;
  created_by?: User;
  created_at: string;
  updated_at: string;
}

export interface PostTagsResponse {
  post_tags: PostTag[];
  count: number;
}

export interface StoreDataResponse {
  store: Store;
  site_settings: SiteSettings;
  navigation_items: NavigationItem[];
  feature_flags: { key: string; value: boolean }[];
  collections: ProductCollection[];
  regions: Region[];
}

export interface RichTextContent {
  blocks: ContentBlock[];
  time: number;
  version: string;
}

export interface SeoDetails {
  title?: string;
  description?: string;
  image?: ImageField;
}

export interface Post {
  id: string;
  type: PostType;
  featured_image_id?: string;
  featured_image?: Image;
  title?: string;
  excerpt?: string;
  content?: RichTextContent;
  content_mode: PostContentMode;
  sections: PostSection[];
  section_ids?: string[];
  tags: PostTag[];
  authors: User[];
  handle: string;
  status: PostStatus;
  seo?: SeoDetails;
  is_home_page?: boolean;
  product_id?: string;
  vendor_id?: string;
  last_updated_by_id?: string;
  last_updated_by?: User;
  root_id?: string;
  root?: Post;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  published_at: string | null;
}

export interface ProductReview {
  id?: string;
  product_id: string;
  product: Product;
  product_variant_id?: string;
  product_variant?: ProductVariant;
  customer_id: string;
  customer: User;
  content: string;
  images?: { created_at: string; deleted_at: string; id: string; metadata: string; updated_at: string; url: string }[];
  rating: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface ProductReviewRequest {
  id: string;
  order_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
export interface PostTemplate {
  id: string;
  isTemplate?: boolean;
  content_mode: PostContentMode.ADVANCED;
  type: PostType;
  title?: string;
  sections: PostSection[];
  sort_order: number;
  status: PostStatus;
  last_updated_by_id?: string;
  last_updated_by?: User;
  created_at: string;
  updated_at: string;
  archived_at?: Date;
  product_id?: string;
  vendor_id?: string;
  seo: never;
}

export enum PostSectionType {
  BUTTON_LIST = 'button_list',
  CTA = 'cta',
  HEADER = 'header',
  HERO = 'hero',
  PRODUCT_CAROUSEL = 'product_carousel',
  PRODUCT_GRID = 'product_grid',
  IMAGE_GALLERY = 'image_gallery',
  RAW_HTML = 'raw_html',
  RICH_TEXT = 'rich_text',
  BLOG_LIST = 'blog_list'
}

export enum PostSectionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum ButtonStyleVariant {
  DEFAULT = 'default',
  PRIMARY = 'primary',
  LINK = 'link'
}

export interface TranslatableField {
  value: string;
  translations?: {
    [key in LanguageCode]?: string;
  };
}

export interface TranslatableRichTextField {
  value: RichTextContent;
  translations?: {
    [key in LanguageCode]: RichTextContent;
  };
}

export interface CustomAction {
  label: TranslatableField;
  url: TranslatableField;
  new_tab?: boolean;
  style_variant?: ButtonStyleVariant;
}

export interface ImageField {
  id?: string;
  url?: string;
  alt?: TranslatableField;
  href?: string;
  width?: number;
  height?: number;
}

export interface ResponsiveImageField {
  default?: ImageField;
  mobile?: ImageField;
}

export enum ThemeColor {
  PRIMARY = 'primary',
  ACCENT = 'accent',
  HIGHLIGHT = 'highlight',
  GRAY = 'gray',
  BLACK = 'black',
  WHITE = 'white'
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
  BLACK = '900'
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
  BOTTOM_RIGHT = 'bottom right'
}

export enum BackgroundSize {
  AUTO = 'auto',
  COVER = 'cover',
  CONTAIN = 'contain'
}

export enum BackgroundRepeat {
  NO_REPEAT = 'no-repeat',
  REPEAT = 'repeat',
  REPEAT_X = 'repeat-x',
  REPEAT_Y = 'repeat-y',
  SPACE = 'space',
  ROUND = 'round'
}

export enum TextAlign {
  AUTO = 'auto',
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify'
}

export interface ThumbnailImage {
  url?: string;
  alt?: TranslatableField;
}

export enum BackgroundType {
  IMAGE = 'image',
  VIDEO = 'video'
}

export interface Video {
  url?: string;
  loop?: boolean;
  thumbnail?: ThumbnailImage;
}

export interface BackgroundOverlay {
  color?: string;
  opacity?: number;
  blur?: number;
  blend_mode?: string;
}

export interface Spacing {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface BaseStyles {
  background_type?: BackgroundType;
  background_image?: ImageField;
  background_color?: string;
  background_position?: BackgroundPosition | string;
  background_size?: BackgroundSize | string;
  background_repeat?: BackgroundRepeat | string;
  background_video?: Video;
  background_overlay?: BackgroundOverlay;
  color?: string;
  text_align?: TextAlign;
  font_family?: string;
  font_size?: string;
  font_weight?: FontWeight;
  padding?: Spacing;
  margin?: Spacing;
  custom_css?: string;
}

export interface ProductListFilter {
  q?: string;
  collection_id?: string[];
  tags?: string[];
  vendor_id?: string[];
  category_id?: string[];
  limit?: number;
  order?: string;
}

export interface ProductListPostSectionContent {
  product_select: 'filter' | 'id';
  product_id?: string[];
  product_filter?: ProductListFilter;
  include_collection_tabs?: boolean;
  collection_tab_id?: ProductCollection['id'][];
  include_category_tabs?: boolean;
  category_tab_id?: ProductCategory['id'][];
}

export interface BasePostSectionContent {
  heading?: TranslatableField;
  text?: TranslatableRichTextField;
  actions?: CustomAction[];
}

export interface BasePostSectionSettings {
  element_id?: string;
  element_class_name?: string;
}

export interface BasePostSectionStyles {
  default?: BaseStyles;
  mobile?: BaseStyles;
}

export interface BasePostSection {
  id: string;
  type: PostSectionType;
  status: PostSectionStatus;
  name: string;
  content: any;
  settings: BasePostSectionSettings;
  styles: BasePostSectionStyles;
  usage_count: number;
  last_updated_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DefaultPostSection extends BasePostSection {
  content: BasePostSectionContent;
}

export interface DefaultPostSectionWithImage extends DefaultPostSection {
  content: BasePostSectionContent & {
    image?: ResponsiveImageField;
  };
}

export interface DefaultPostSectionWithProductList extends DefaultPostSection {
  content: BasePostSectionContent & ProductListPostSectionContent;
}

export interface ButtonListPostSection extends DefaultPostSection {
  type: PostSectionType.BUTTON_LIST;
}

export interface CTAPostSection extends DefaultPostSection {
  type: PostSectionType.CTA;
}

export interface HeaderPostSection extends DefaultPostSection {
  type: PostSectionType.HEADER;
}

export interface BlogListPostSection extends DefaultPostSection {
  type: PostSectionType.BLOG_LIST;
}

export type HeroLayout = 'full-width' | 'contained' | 'full-width-inverse' | 'contained-inverse';

export interface HeroPostSection extends DefaultPostSectionWithImage {
  content: BasePostSectionContent & {
    image?: ResponsiveImageField;
    layout: HeroLayout;
  };
  type: PostSectionType.HERO;
}

export interface ProductCarouselPostSection extends DefaultPostSectionWithProductList {
  type: PostSectionType.PRODUCT_CAROUSEL;
}

export interface ProductGridPostSection extends DefaultPostSectionWithProductList {
  type: PostSectionType.PRODUCT_GRID;
}

export type ImageGalleryLayout =
  | 'rows'
  | 'columns'
  | 'masonry'
  | 'rows-full-width'
  | 'columns-full-width'
  | 'masonry-full-width';

export interface ImageGalleryPostSection extends DefaultPostSection {
  type: PostSectionType.IMAGE_GALLERY;
  content: BasePostSectionContent & {
    gallery?: ImageField[];
    layout?: ImageGalleryLayout;
    spacing?: number;
    columns?: number;
  };
}

export interface RawHTMLPostSection extends BasePostSection {
  type: PostSectionType.RAW_HTML;
  content: { html: TranslatableField };
}

export interface RichTextPostSection extends BasePostSection {
  type: PostSectionType.RICH_TEXT;
  content: { text: TranslatableRichTextField };
}

export type PostSection =
  | ButtonListPostSection
  | CTAPostSection
  | HeaderPostSection
  | HeroPostSection
  | ProductCarouselPostSection
  | ProductGridPostSection
  | ImageGalleryPostSection
  | RawHTMLPostSection
  | RichTextPostSection
  | BlogListPostSection;

export interface PostSectionsListRes {
  post_sections: PostSection[];
  count: number;
}

export interface ProductFilterOptionsParams extends StoreGetProductsParams {
  include_product_count?: boolean;
  order?: string;
}

export interface ProductFilterOptionsRes {
  tags: (ProductTag & { product_count: number })[];
  collections: (ProductCollection & { product_count: number })[];
  types: (ProductType & { product_count: number })[];
  categories: (ProductCategory & { product_count: number })[];
  order?: string;
}

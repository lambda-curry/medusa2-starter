import { MedusaStore, OpenAPIConfig } from '@markethaus/storefront-client';
import { getMarketplaceContext } from '../marketplace/marketplace-context.server';
import { authCookie } from '../server/auth.server';
import { getCookie } from '../server/cookies.server';
import {
  NewsletterSubscriberResource,
  PostTemplatesResource,
  ProductReviewRequestsResource,
  StoreDataResource
} from './resources';
import { FilterOptionsResource } from './resources/filter-options';
import { PostSectionsResource } from './resources/post-sections';
import { PostTagsResource } from './resources/post-tags';
import { PostsResource } from './resources/posts';
import { ProductReviewsResource } from './resources/product-reviews.server';
import { SiteSettingsResource } from './resources/site-settings';
import { VendorsService } from './resources/vendors';

export class Medusa extends MedusaStore {
  public vendors: VendorsService;
  siteSettings: SiteSettingsResource;
  posts: PostsResource;
  postTemplates: PostTemplatesResource;
  postTags: PostTagsResource;
  postSections: PostSectionsResource;
  filterOptions: FilterOptionsResource;
  productReviews: ProductReviewsResource;
  productReviewRequests: ProductReviewRequestsResource;
  storeData: StoreDataResource;
  newsletterSubscriptions: NewsletterSubscriberResource;

  constructor(config?: Partial<OpenAPIConfig>) {
    super(config);

    this.vendors = new VendorsService(this.request);
    this.siteSettings = new SiteSettingsResource(this.request);
    this.posts = new PostsResource(this.request);
    this.postTemplates = new PostTemplatesResource(this.request);
    this.postTags = new PostTagsResource(this.request);
    this.postSections = new PostSectionsResource(this.request);
    this.filterOptions = new FilterOptionsResource(this.request);
    this.storeData = new StoreDataResource(this.request);
    this.productReviews = new ProductReviewsResource(this.request);
    this.productReviewRequests = new ProductReviewRequestsResource(this.request);
    this.newsletterSubscriptions = new NewsletterSubscriberResource(this.request);
  }
}

export const createMedusaClient = async ({ request }: { request: Partial<Request> }): Promise<Medusa> => {
  if (!request.headers) throw Error('No request provided for creating the Medusa Client');

  const { api_url, tenant_id } = await getMarketplaceContext(request);

  const updatedHeaders = new Headers(request.headers);

  if (!api_url) throw Error('No backend url provided for creating the Medusa Client');

  const accessToken = await getCookie(request.headers, authCookie);

  const config = {
    BASE: api_url,
    HEADERS: {
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
      'X-Tenant-ID': tenant_id ?? '',
      'X-Forwarded-Proto': 'https'
    }
  };

  return new Medusa(config);
};

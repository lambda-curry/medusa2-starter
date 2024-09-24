import { BaseHttpRequest, CancelablePromise } from '@markethaus/storefront-client';
import { CreateNewsletterSubscriberReq, NewsletterSubscriberRes } from '../types';

export class NewsletterSubscriberResource {
  constructor(public readonly client: BaseHttpRequest) {}
  subscribeEmail(
    data: CreateNewsletterSubscriberReq,
    customHeaders: Record<string, any> = {}
  ): CancelablePromise<NewsletterSubscriberRes> {
    const path = `/store/newsletter-subscriptions`;

    return this.client.request({
      method: 'POST',
      url: path,
      body: data,
      headers: customHeaders
    });
  }
}

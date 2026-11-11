import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import {
  ContainerRegistrationKeys,
  ProductCategoryWorkflowEvents,
  ProductCollectionWorkflowEvents,
  ProductVariantWorkflowEvents,
  ProductWorkflowEvents,
} from '@medusajs/framework/utils';

/**
 * Tells the storefront to drop its cached catalog when products change, so a change made in the admin or through
 * MCP shows on the next page load instead of after the storefront's cache expires. Does nothing unless
 * STOREFRONT_URL and STOREFRONT_REVALIDATE_SECRET are set.
 */
export default async function storefrontRevalidate({ event, container }: SubscriberArgs) {
  const storefrontUrl = process.env.STOREFRONT_URL;
  const secret = process.env.STOREFRONT_REVALIDATE_SECRET;
  if (!storefrontUrl || !secret) return;

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  try {
    const response = await fetch(new URL('/api/revalidate', storefrontUrl), {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) logger.warn(`Storefront revalidate after ${event.name} returned HTTP ${response.status}`);
  } catch (error) {
    logger.warn(`Storefront revalidate after ${event.name} failed: ${(error as Error).message}`);
  }
}

export const config: SubscriberConfig = {
  event: [
    ...Object.values(ProductWorkflowEvents),
    ...Object.values(ProductVariantWorkflowEvents),
    ...Object.values(ProductCategoryWorkflowEvents),
    ...Object.values(ProductCollectionWorkflowEvents),
  ],
};

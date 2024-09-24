import { CollectionList } from '@ui-components/collection/collection-list';
import { CollectionListItem } from '@ui-components/collection/collection-list-item';
import { ProductWithReviews } from '@marketplace/util/medusa';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { withProductsAndReviewStats } from '@marketplace/util/server/reviews.server';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });

  const { collections } = await client.productCollections.list({});

  const deferredProductsByCollection = collections.reduce((acc, collection) => {
    acc[collection.handle!] = withProductsAndReviewStats(request, {
      collection_id: [collection.id],
    }).then(({ products, count, limit, offset }) => ({
      products,
      count,
      limit,
      offset,
    }));

    return acc;
  }, {} as Record<string, Promise<{ products: ProductWithReviews[] }>>);

  return { collections, deferredProductsByCollection };
};

export default function CollectionsIndexRoute() {
  const { collections, deferredProductsByCollection } =
    useLoaderData<typeof loader>();

  return (
    <CollectionList
      collections={collections}
      deferredProductsByCollection={deferredProductsByCollection}
      renderCollectionListItem={props => <CollectionListItem {...props} />}
    />
  );
}

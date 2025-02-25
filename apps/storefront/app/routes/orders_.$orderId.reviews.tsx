import { Container } from '@app/components/common/container';
import { ProductReviewComponent } from '@app/components/reviews/ProductReviewComponent';
import { formatDate } from '@libs/util';
import { sdk } from '@libs/util/server/client.server';
import { fetchProductReviews } from '@libs/util/server/data/product-reviews.server';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ButtonLink } from '@app/components/common/buttons';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { order } = await sdk.store.order.retrieve(params.orderId || '', {});

  if (!order) throw redirect('/');

  const { product_reviews } = await fetchProductReviews({ order_id: order.id }, { forceFresh: true });

  return { order, product_reviews };
};

export default function OrderReviewsRoute() {
  const { order, product_reviews } = useLoaderData<typeof loader>();

  const fulfilledItems = order.items || [];
  const uniqueItems: { [key: string]: any } = {};

  for (const item of fulfilledItems) {
    uniqueItems[item.product_id as string] = item;
  }

  return (
    <section>
      <Container className="!max-w-3xl pb-16">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 p-4">
              <dl className="mr-4 flex flex-wrap gap-x-6 gap-y-4">
                <div>
                  <dt className="text-2xs font-bold text-gray-900">Order</dt>
                  <dd className="mt-1 text-gray-500">#{order.display_id}</dd>
                </div>
                <div>
                  <dt className="text-2xs font-bold text-gray-900">Date placed</dt>
                  <dd className="mt-1 text-gray-500">
                    <time dateTime={order.created_at as string}>
                      {formatDate(new Date(order.created_at as string))}
                    </time>
                  </dd>
                </div>
              </dl>
              <div className="flex-auto"></div>
            </div>

            <ul role="list" className="mt-4 divide-y divide-gray-200 text-sm font-bold text-gray-500">
              {Object.values(uniqueItems)?.map((item) => {
                const review = product_reviews
                  ? product_reviews.find((review) => review.product_id === item.variant.product_id)
                  : undefined;

                return (
                  <li key={item.id}>
                    <ProductReviewComponent orderId={order.id} lineItem={item} productReview={review} />
                  </li>
                );
              })}
            </ul>

            <div className="mt-16 border-t border-gray-200 pt-6 text-right">
              <Link to="/products">
                <ButtonLink className="font-bold no-underline">
                  Continue Shopping
                  <span aria-hidden="true"> &rarr;</span>
                </ButtonLink>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { Breadcrumbs } from '@components/breadcrumbs/Breadcrumbs';
import { ButtonLink } from '@components/buttons';
import { Container } from '@components/container/Container';
import { useCustomer } from '@ui-components/hooks/useCustomer';
import { formatDate } from '@marketplace/util/formatters';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { ProductReviewComponent } from '~/components/reviews/ProductReviewComponent';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });
  const { reviewRequest } = await client.productReviewRequests.retrieve(
    params.requestId || ''
  );

  if (!reviewRequest) throw redirect('/');

  const { order } = await client.orders.retrieve(reviewRequest.order_id, {});

  const { reviews } = await client.productReviews.list({ order_id: order.id });

  if (!order) throw redirect('/');

  return { order, reviews, reviewRequest };
};

export default function OrderReviewsRoute() {
  const { customer } = useCustomer();
  const { order, reviews, reviewRequest } = useLoaderData<typeof loader>();

  const breadcrumbs = [
    {
      label: (
        <span className="flex whitespace-nowrap">
          <HomeIcon className="inline h-4 w-4" />
          <span className="sr-only">Home</span>
        </span>
      ),
      url: `/`,
    },
    {
      label: 'My Orders',
      url: '/orders',
    },
    {
      label: `Order #${order.display_id}`,
      url: `/orders/${order.id}`,
    },
    {
      label: `Reviews`,
    },
  ];

  const filteredItems = order.items.filter(
    item => item?.fulfilled_quantity ?? 0 > 0
  );
  const uniqueItems: { [key: string]: any } = {};
  for (const item of filteredItems) {
    uniqueItems[item.variant.product_id] = item;
  }

  return (
    <section className={clsx({ 'py-8': !customer })}>
      <Container className="!max-w-3xl pb-16">
        {customer && <Breadcrumbs breadcrumbs={breadcrumbs} className="my-8" />}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 p-4">
              <dl className="mr-4 flex flex-wrap gap-x-6 gap-y-4">
                <div>
                  <dt className="text-2xs font-bold text-gray-900">Order</dt>
                  <dd className="mt-1 text-gray-500">#{order.display_id}</dd>
                </div>
                <div>
                  <dt className="text-2xs font-bold text-gray-900">
                    Date placed
                  </dt>
                  <dd className="mt-1 text-gray-500">
                    <time dateTime={order.created_at}>
                      {formatDate(new Date(order.created_at))}
                    </time>
                  </dd>
                </div>
              </dl>
              <div className="flex-auto"></div>
            </div>

            <ul
              role="list"
              className="mt-4 divide-y divide-gray-200 text-sm font-bold text-gray-500"
            >
              {Object.values(uniqueItems)?.map(item => {
                const review = reviews
                  ? reviews.find(
                      review => review.product_id === item.variant.product_id
                    )
                  : undefined;

                return (
                  <li key={item.id}>
                    <ProductReviewComponent
                      lineItem={item}
                      productReview={review}
                      requestId={reviewRequest.id}
                    />
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

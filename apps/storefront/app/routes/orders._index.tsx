import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { useCart } from '@ui-components/hooks/useCart';
import { Breadcrumbs } from '@components/breadcrumbs/Breadcrumbs';
import { Container } from '@components/container/Container';
import { Image } from '@components/images/Image';
import { FulfillmentStatus } from '@components/status-indicators/FulfillmentStatus';
import { formatDate } from '@marketplace/util/formatters';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { formatPrice } from '@marketplace/util/prices';
import { withPaginationParams } from '@marketplace/util/remix/withPaginationParams';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { PaginationWithContext } from '@components/Pagination/pagination-with-context';
import { StarRating } from '../components/reviews/StarRating';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });

  const { limit, offset } = withPaginationParams({ request });

  let orders, count;

  try {
    const ordersResponse = await client.customers.listOrders({ limit, offset });
    orders = ordersResponse.orders;
    count = ordersResponse.count;
  } catch (error: any) {
    if (error.status === 401) throw redirect('/');
  }

  if (!orders || orders.length < 1) throw redirect('/');

  const orderProducts = orders.flatMap(order =>
    order?.items.map(item => item?.variant.product_id)
  );
  const { reviews: orderProductReviews } = await client.productReviews.list({
    product_id: orderProducts,
    customer_id: orders[0].customer.id,
  });

  return { orders, count, limit, offset, orderProductReviews };
};

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
  },
];

export default function ProductsIndexRoute() {
  const {
    orders,
    orderProductReviews,
    count = 0,
    limit,
    offset,
  } = useLoaderData<typeof loader>();
  const paginationConfig = { count, limit, offset };
  const { cart } = useCart();

  return (
    <Container className="!max-w-3xl">
      <div className="mb-8">
        <Breadcrumbs breadcrumbs={breadcrumbs} className="my-8" />

        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Order history
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Check the status of recent orders, manage returns, and view more
          details.
        </p>

        <h2 className="sr-only">Recent orders</h2>
        <div className="mx-auto mt-12 space-y-8 lg:px-0">
          {orders.map(order => (
            <div
              key={order.id}
              className="border-b border-t border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border"
            >
              <h3 className="sr-only">
                Order placed on{' '}
                <time dateTime={order.created_at}>
                  {formatDate(new Date(order.created_at))}
                </time>
              </h3>

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
                  <div>
                    <dt className="text-2xs font-bold text-gray-900">Total</dt>
                    <dd className="mt-1 text-gray-900">
                      {formatPrice(order.total, {
                        currency: order.region.currency_code,
                      })}
                    </dd>
                  </div>
                </dl>
                <div className="flex-auto"></div>

                <div className="xs:flex-row xs:items-start flex flex-col justify-end  space-x-4 ">
                  {[
                    'fulfilled',
                    'partially_fulfilled',
                    'partially_shipped',
                    'shipped',
                    'partially_returned',
                    'returned',
                  ].includes(order.fulfillment_status) && (
                    <Link
                      to={`/orders/${order.id}/reviews`}
                      className="focus:ring-primary-500 w-34 flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                      <span>Review Products</span>
                      <span className="sr-only">{order.id}</span>
                    </Link>
                  )}

                  <Link
                    to={`/orders/${order.id}`}
                    className="focus:ring-primary-500 xs:!ml-2 xs:mt-0 !ml-0 mt-2 flex w-28 items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <span>View Order</span>
                    <span className="sr-only">{order.id}</span>
                  </Link>
                </div>
              </div>

              {/* Products */}
              <h4 className="sr-only">Items</h4>
              <ul role="list" className="divide-y divide-gray-200">
                {order.items.map(item => (
                  <li key={item.id} className="p-4 sm:p-6">
                    <div className="flex items-center sm:items-start">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 sm:h-40 sm:w-40">
                        {item.thumbnail && (
                          <Image
                            src={item.thumbnail}
                            alt={item.description || item.title}
                            className="h-full w-full object-cover object-center"
                          />
                        )}
                      </div>
                      <div className="ml-6 flex-1 text-sm">
                        <div className="flex flex-col gap-2 font-medium text-gray-900 sm:flex-row">
                          <h5 className="flex-1">{item.title}</h5>
                          <div className="flex items-center gap-2">
                            <p>
                              {formatPrice(item.unit_price, {
                                currency: order.region.currency_code,
                              })}
                            </p>
                            <div className="whitespace-nowrap font-normal text-gray-500">
                              Qty {item.quantity}
                            </div>
                          </div>
                        </div>
                        <p className="hidden whitespace-pre-wrap text-gray-500 sm:mt-0.5 sm:block">
                          {item.description}
                        </p>

                        <StarRating
                          className="mt-3"
                          value={
                            orderProductReviews?.find(
                              review =>
                                review.product_id === item.variant.product_id
                            )?.rating
                          }
                          readOnly
                        />

                        {item.variant.product.customer_response_prompt &&
                          item.customer_product_response && (
                            <>
                              <p className="mt-2.5 text-xs font-bold text-gray-500">
                                {item.variant.product.customer_response_prompt}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-500">
                                {item.customer_product_response
                                  ? item.customer_product_response
                                  : 'No response given'}
                              </p>
                            </>
                          )}
                      </div>
                    </div>

                    <div className="mt-6 sm:flex sm:justify-between">
                      <div className="flex items-center">
                        <FulfillmentStatus status={order.fulfillment_status} />
                        {/* <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                              <p className="ml-2 text-sm font-medium text-gray-500">
                                Delivered on <time dateTime={order.deliveredDatetime}>{order.deliveredDate}</time>
                              </p> */}
                      </div>

                      <div className="mt-6 flex items-center space-x-4 divide-x divide-gray-200 border-t border-gray-200 pt-4 text-sm font-medium sm:ml-4 sm:mt-0 sm:border-none sm:pt-0">
                        <div className="flex flex-1 justify-center">
                          <Link
                            to={`/products/${item.variant.product.handle}`}
                            prefetch="intent"
                            className="flex items-center whitespace-nowrap hover:underline"
                          >
                            View product
                            <ArrowRightIcon className="ml-1.5 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {paginationConfig && (
          <PaginationWithContext
            context="orders"
            paginationConfig={paginationConfig}
          />
        )}
      </div>
    </Container>
  );
}

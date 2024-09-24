import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { useCustomer } from '@ui-components/hooks/useCustomer';
import { useEnv } from '@ui-components/hooks/useEnv';
import { Breadcrumbs } from '@components/breadcrumbs/Breadcrumbs';
import { ButtonLink } from '@components/buttons';
import { Container } from '@components/container/Container';
import { CreditCardIcon } from '@components/icons/CreditCardIcon';
import { Image } from '@components/images/Image';
import { FulfillmentStatus } from '@components/status-indicators/FulfillmentStatus';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { getOrderPaymentData } from '@marketplace/util/orders';
import { formatPhoneNumber } from '@utils/phoneNumber';
import { formatPrice } from '@marketplace/util/prices';
import { type Payment } from '@utils/types';
import { ShippingMethod } from '@markethaus/storefront-client';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });

  const { order } = await client.orders.retrieve(params.orderId || '', {});

  if (!order) throw redirect('/');

  return { order };
};

export default function CheckoutSuccessRoute() {
  const { env } = useEnv();
  const shippingDisabled = env.DISABLE_SHIPPING;
  const { customer } = useCustomer();
  const { order } = useLoaderData<typeof loader>();
  const discountTotal = order.discount_total || 0;
  const {
    shipping_address: shippingAddress,
    billing_address: billingAddress,
    // NOTE: Not sure why, but the type for `shipping_methods` is coming through as `SerializeDeferred<Record<string, unknown>>[]`
    // This is happening in other places with `shipping_options`, as well.
    shipping_methods: shippingMethods,
    payments,
  } = order;

  // Note: the Medusa `Order` type is poorly defined. It doesn't have a `charges` field at all.
  const paymentMethodDetails = getOrderPaymentData(
    payments as unknown as Payment[]
  );

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
    },
  ];

  return (
    <section className={clsx({ 'py-8': !customer })}>
      <Container className="!max-w-3xl pb-16">
        {customer && <Breadcrumbs breadcrumbs={breadcrumbs} className="my-8" />}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="flex justify-between">
              <h2 className="text-primary-600 text-sm font-bold">
                #{order.display_id}
              </h2>
              <FulfillmentStatus status={order.fulfillment_status} />
            </div>

            {/* <dl className="mt-16 text-sm font-bold">
            <dt className="text-gray-900">Tracking number</dt>
            <dd className="mt-2 text-primary-600">51547878755545848512</dd>
          </dl> */}

            <ul
              role="list"
              className="mt-4 divide-y divide-gray-200 border-t border-gray-200 text-sm font-bold text-gray-500"
            >
              {order.items.map(item => (
                <li key={item.id} className="flex flex-wrap gap-6 py-6">
                  {item.thumbnail && (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      className="h-24 w-24 flex-none rounded-md bg-gray-100 object-cover object-center"
                    />
                  )}
                  <div className="flex max-w-full flex-auto flex-col gap-y-2">
                    <div>
                      <h3 className="text-base text-gray-900">
                        {!!item.variant?.product && (
                          <Link
                            className="break-words"
                            to={`/products/${item.variant.product.handle}`}
                          >
                            {item.title}
                          </Link>
                        )}
                        {!item.variant?.product && <div>{item.title}</div>}
                      </h3>
                      <p className="break-words text-sm font-normal text-gray-500">
                        {item.variant.title}
                      </p>
                      {item.variant.product.customer_response_prompt &&
                        item.customer_product_response && (
                          <>
                            <p className="mt-2.5 text-xs font-bold text-gray-500">
                              {item.variant.product.customer_response_prompt}
                            </p>
                            <p className="mt-0.5 text-xs font-normal text-gray-500">
                              {item.customer_product_response
                                ? item.customer_product_response
                                : 'No response given'}
                            </p>
                          </>
                        )}
                    </div>

                    <div className="flex flex-1 items-end">
                      <span className="font-normal backdrop:text-gray-500">
                        Qty {item.quantity}
                      </span>
                      {/* <p>{product.color}</p>
                  <p>{product.size}</p> */}
                    </div>
                  </div>
                  <p className="flex-none font-bold text-gray-900">
                    {formatPrice(item.unit_price, {
                      currency: order.region.currency_code,
                    })}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="space-y-6 border-t border-gray-200 pt-6 text-sm font-bold text-gray-500">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="text-gray-900">
                  {formatPrice(order.subtotal, {
                    currency: order.region.currency_code,
                  })}
                </dd>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between">
                  <dt>Discount</dt>
                  <dd className="text-gray-900">
                    {formatPrice(-discountTotal, {
                      currency: order.region.currency_code,
                    })}
                  </dd>
                </div>
              )}

              {!shippingDisabled && (
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd className="text-gray-900">
                    {formatPrice(order.shipping_total, {
                      currency: order.region.currency_code,
                    })}
                  </dd>
                </div>
              )}

              <div className="flex justify-between">
                <dt>Taxes</dt>
                <dd className="text-gray-900">
                  {formatPrice(order.tax_total, {
                    currency: order.region.currency_code,
                  })}
                </dd>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                <dt className="text-base">Total</dt>
                <dd className="text-gray-900">
                  {formatPrice(order.total, {
                    currency: order.region.currency_code,
                  })}
                </dd>
              </div>
            </dl>

            <div className={clsx('w-full', { flex: !customer })}>
              <dl className="mt-12 grid w-full grid-cols-2 gap-x-4 border-t border-gray-200 pt-12 text-sm text-gray-600">
                {!shippingDisabled && (
                  <div>
                    <dt className="font-bold text-gray-900">
                      Shipping Address
                    </dt>
                    <dd className="mt-2">
                      <address className="not-italic">
                        <span className="block">
                          {shippingAddress.first_name}{' '}
                          {shippingAddress.last_name}
                        </span>
                        <span className="block">
                          {shippingAddress.address_1}
                        </span>
                        {shippingAddress.address_2 && (
                          <span className="block">
                            {shippingAddress.address_2}
                          </span>
                        )}
                        <span className="block">
                          {shippingAddress.city}, {shippingAddress.province}{' '}
                          {shippingAddress.postal_code}
                        </span>
                        <span className="block uppercase">
                          {shippingAddress.country_code}
                        </span>
                        {shippingAddress.phone && (
                          <span className="block">
                            {formatPhoneNumber(shippingAddress.phone)}
                          </span>
                        )}
                      </address>
                    </dd>
                  </div>
                )}
                {customer && !!billingAddress && (
                  <div>
                    <dt className="font-bold text-gray-900">Billing address</dt>
                    <dd className="mt-2">
                      <address className="not-italic">
                        <span className="block">
                          {billingAddress.first_name} {billingAddress.last_name}
                        </span>
                        <span className="block">
                          {billingAddress.address_1}
                        </span>
                        {billingAddress.address_2 && (
                          <span className="block">
                            {billingAddress.address_2}
                          </span>
                        )}
                        <span className="block">
                          {billingAddress.city}, {billingAddress.province}{' '}
                          {billingAddress.postal_code}
                        </span>
                        <span className="block uppercase">
                          {billingAddress.country_code}
                        </span>
                        {billingAddress.phone && (
                          <span className="block">
                            {formatPhoneNumber(billingAddress.phone)}
                          </span>
                        )}
                      </address>
                    </dd>
                  </div>
                )}
              </dl>

              <dl className="mt-12 grid w-full grid-cols-2 gap-x-4 border-t border-gray-200 pt-12 text-sm text-gray-600">
                {customer &&
                  !!paymentMethodDetails &&
                  !!paymentMethodDetails.card && (
                    <div>
                      <dt className="font-bold text-gray-900">
                        Payment method
                      </dt>
                      <dd className="mt-2 gap-y-2 sm:flex sm:gap-x-4 sm:gap-y-0">
                        <div className="flex-none">
                          <CreditCardIcon
                            brand={paymentMethodDetails.card.brand}
                          />
                          <p className="sr-only">
                            {paymentMethodDetails.card.brand}
                          </p>
                        </div>
                        <div className="flex-auto">
                          <p className="text-gray-900">
                            Ending with {paymentMethodDetails.card.last4}
                          </p>
                          <p>
                            Expires {paymentMethodDetails.card.exp_month} /{' '}
                            {paymentMethodDetails.card.exp_year}
                          </p>
                        </div>
                      </dd>
                    </div>
                  )}

                {!shippingDisabled && !!shippingMethods?.length && (
                  <div>
                    <dt className="font-bold text-gray-900">Shipping method</dt>
                    <dd className="mt-2">
                      {shippingMethods[0].shipping_option.name}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

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

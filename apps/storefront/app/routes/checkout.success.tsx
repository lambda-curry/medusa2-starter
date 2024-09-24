import { ButtonLink } from '@components/buttons/ButtonLink';
import { Container } from '@components/container/Container';
import { CreditCardIcon } from '@components/icons/CreditCardIcon';
import { Image } from '@components/images/Image';
import { formatPhoneNumber } from '@utils/phoneNumber';
import { type Payment } from '@utils/types';
import { useEnv } from '@ui-components/hooks/useEnv';
import { useSendPurchaseEvent } from '@marketplace/util/analytics/hooks/checkout';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { getOrderPaymentData } from '@marketplace/util/orders';
import { formatPrice } from '@marketplace/util/prices';
import { LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });

  const url = new URL(request.url);

  const cartId = url.searchParams.get('cart_id') || '';

  const { order } = await client.orders.retrieveByCartId(cartId);

  return { order };
};

export default function CheckoutSuccessRoute() {
  const { env } = useEnv();
  const shippingDisabled = env.DISABLE_SHIPPING;
  const { order } = useLoaderData<typeof loader>();
  const discountTotal = order.discount_total || 0;
  useSendPurchaseEvent(order);

  const {
    shipping_address: shippingAddress,
    billing_address: billingAddress,
    shipping_methods: shippingMethods,
    payments,
  } = order;

  // Note: the Medusa `Order` type is poorly defined. It doesn't have a `charges` field at all.
  const paymentMethodDetails = getOrderPaymentData(
    payments as unknown as Payment[]
  );

  return (
    <section className="py-8">
      <Container className="!max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-8 sm:p-12 lg:p-16">
            <h1 className="text-primary-600 text-sm font-bold">
              Payment successful
            </h1>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Thanks for ordering
            </p>
            <p className="mt-2 text-base text-gray-500">
              We appreciate your order, we're currently processing it. Hang
              tight and we'll send you confirmation very soon!
            </p>

            {/* <dl className="mt-16 text-sm font-bold">
            <dt className="text-gray-900">Tracking number</dt>
            <dd className="mt-2 text-primary-600">51547878755545848512</dd>
          </dl> */}

            <ul
              role="list"
              className="mt-8 divide-y divide-gray-200 border-t border-gray-200 text-sm font-bold text-gray-500"
            >
              {order.items.map(item => (
                <li key={item.id} className="flex space-x-6 py-6">
                  {item.thumbnail && (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      className="h-24 w-24 flex-none rounded-md bg-gray-100 object-cover object-center"
                    />
                  )}
                  <div className="flex flex-auto flex-col space-y-1">
                    <div>
                      <h3 className="text-base text-gray-900">
                        {!!item.variant?.product?.handle && (
                          <Link to={`/products/${item.variant.product.handle}`}>
                            {item.title}
                          </Link>
                        )}
                        {!item.variant?.product?.handle && (
                          <div>{item.title}</div>
                        )}
                      </h3>
                      {!!item.variant?.title && (
                        <p className="text-sm font-normal text-gray-500">
                          {item.variant.title}
                        </p>
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

            <dl className="mt-12 grid grid-cols-2 gap-x-4 border-t border-gray-200 pt-12 text-sm text-gray-600">
              {!shippingDisabled && (
                <div>
                  <dt className="font-bold text-gray-900">Shipping Address</dt>
                  <dd className="mt-2">
                    <address className="not-italic">
                      <span className="block">
                        {shippingAddress.first_name} {shippingAddress.last_name}
                      </span>
                      <span className="block">{shippingAddress.address_1}</span>
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
              {!!billingAddress && (
                <div>
                  <dt className="font-bold text-gray-900">Billing address</dt>
                  <dd className="mt-2">
                    <address className="not-italic">
                      <span className="block">
                        {billingAddress.first_name} {billingAddress.last_name}
                      </span>
                      <span className="block">{billingAddress.address_1}</span>
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

            <dl className="mt-12 grid grid-cols-2 gap-x-4 border-t border-gray-200 pt-12 text-sm text-gray-600">
              {!!paymentMethodDetails && !!paymentMethodDetails.card && (
                <div>
                  <dt className="font-bold text-gray-900">Payment method</dt>
                  <dd className="mt-2 gap-y-2 sm:flex sm:gap-x-4 sm:gap-y-0">
                    <div className="flex-none">
                      <CreditCardIcon brand={paymentMethodDetails.card.brand} />
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

              {!shippingDisabled && (
                <div>
                  <dt className="font-bold text-gray-900">
                    Shipping method(s)
                  </dt>
                  {shippingMethods &&
                    shippingMethods.map(sm => (
                      <dd key={sm.id} className="mt-2">
                        {sm.shipping_option?.name}
                      </dd>
                    ))}
                </div>
              )}
            </dl>

            <div className="mt-16 border-t border-gray-200 pt-6 text-right">
              <ButtonLink
                as={buttonProps => <Link to="/products" {...buttonProps} />}
              >
                Continue Shopping<span aria-hidden="true"> &rarr;</span>
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

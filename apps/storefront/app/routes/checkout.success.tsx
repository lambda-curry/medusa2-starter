import { ButtonLink } from '@app/components/common/buttons/ButtonLink';
import { Container } from '@app/components/common/container/Container';
import { Image } from '@app/components/common/images/Image';
import { formatPhoneNumber } from '@libs/util/phoneNumber';
import { formatPrice } from '@libs/util/prices';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { retrieveOrder } from '@libs/util/server/data/orders.server';
import { StoreOrder, StorePaymentCollection } from '@medusajs/types';

export const loader = async ({ request }: LoaderFunctionArgs): Promise<{ order: StoreOrder }> => {
  const url = new URL(request.url);

  const orderId = url.searchParams.get('order_id') || '';

  if (!orderId) {
    throw redirect('/');
  }

  const order = await retrieveOrder(request, orderId);

  return { order };
};

export default function CheckoutSuccessRoute() {
  const { order } = useLoaderData<typeof loader>();
  const discountTotal = order.discount_total || 0;

  const {
    shipping_address: shippingAddress,
    billing_address: billingAddress,
    shipping_methods: shippingMethods,
  } = order as StoreOrder;

  return (
    <section className="py-8">
      <Container className="!max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-8 sm:p-12 lg:p-16">
            <h1 className="text-primary-600 text-sm font-bold">Payment successful</h1>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Thanks for ordering</p>
            <p className="mt-2 text-base text-gray-500">
              We appreciate your order, we're currently processing it. Hang tight and we'll send you confirmation very
              soon!
            </p>

            <ul
              role="list"
              className="mt-8 divide-y divide-gray-200 border-t border-gray-200 text-sm font-bold text-gray-500"
            >
              {order.items?.map((item) => (
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
                        <Link to={`/products/${item.product_handle}`}>{item.product_title}</Link>
                      </h3>
                      <p className="text-sm font-normal text-gray-500">{item.variant_title}</p>
                    </div>
                    <div className="flex flex-1 items-end">
                      <span className="font-normal backdrop:text-gray-500">Qty {item.quantity}</span>
                    </div>
                  </div>
                  <p className="flex-none font-bold text-gray-900">
                    {formatPrice(item.unit_price, {
                      currency: order.currency_code,
                    })}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="space-y-6 border-t border-gray-200 pt-6 text-sm font-bold text-gray-500">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="text-gray-900">
                  {formatPrice(order.item_subtotal, {
                    currency: order.currency_code,
                  })}
                </dd>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between">
                  <dt>Discount</dt>
                  <dd className="text-gray-900">
                    {formatPrice(-discountTotal, {
                      currency: order.currency_code,
                    })}
                  </dd>
                </div>
              )}

              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd className="text-gray-900">
                  {formatPrice(order.shipping_total, {
                    currency: order.currency_code,
                  })}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt>Taxes</dt>
                <dd className="text-gray-900">
                  {formatPrice(order.tax_total, {
                    currency: order.currency_code,
                  })}
                </dd>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                <dt className="text-base">Total</dt>
                <dd className="text-gray-900">
                  {formatPrice(order.total, {
                    currency: order.currency_code,
                  })}
                </dd>
              </div>
            </dl>

            <dl className="mt-12 grid grid-cols-2 gap-x-4 border-t border-gray-200 pt-12 text-sm text-gray-600">
              {!!shippingAddress && (
                <div>
                  <dt className="font-bold text-gray-900">Shipping Address</dt>
                  <dd className="mt-2">
                    <address className="not-italic">
                      <span className="block">
                        {shippingAddress.first_name} {shippingAddress.last_name}
                      </span>
                      <span className="block">{shippingAddress.address_1}</span>
                      {shippingAddress.address_2 && <span className="block">{shippingAddress.address_2}</span>}
                      <span className="block">
                        {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}
                      </span>
                      <span className="block uppercase">{shippingAddress.country_code}</span>
                      {shippingAddress.phone && (
                        <span className="block">{formatPhoneNumber(shippingAddress.phone)}</span>
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
                      {billingAddress.address_2 && <span className="block">{billingAddress.address_2}</span>}
                      <span className="block">
                        {billingAddress.city}, {billingAddress.province} {billingAddress.postal_code}
                      </span>
                      <span className="block uppercase">{billingAddress.country_code}</span>
                      {billingAddress.phone && <span className="block">{formatPhoneNumber(billingAddress.phone)}</span>}
                    </address>
                  </dd>
                </div>
              )}
            </dl>

            <dl className="mt-12 grid grid-cols-2 gap-x-4 border-t border-gray-200 pt-12 text-sm text-gray-600">
              <div>
                <dt className="font-bold text-gray-900">
                  Shipping method{(shippingMethods?.length || 0) > 1 ? 's' : ''}
                </dt>
                {shippingMethods &&
                  shippingMethods.map((sm) => (
                    <dd key={sm.id} className="mt-2">
                      {sm.name}
                    </dd>
                  ))}
              </div>
            </dl>

            <div className="mt-16 border-t border-gray-200 pt-6 text-right">
              <ButtonLink as={(buttonProps) => <Link to="/products" {...buttonProps} />}>
                Continue Shopping<span aria-hidden="true"> &rarr;</span>
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

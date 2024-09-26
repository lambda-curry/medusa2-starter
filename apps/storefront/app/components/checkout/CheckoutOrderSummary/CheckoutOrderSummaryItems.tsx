import { Button } from '@components/buttons/Button';
import { Image } from '@components/images/Image';
import { LineItemQuantitySelect } from '@ui-components/cart/line-items/LineItemQuantitySelect';
import { useCart } from '@ui-components/hooks/useCart';
import { useRemoveCartItem } from '@ui-components/hooks/useRemoveCartItem';
import type { Cart, LineItem } from '@libs/util/medusa';
import { formatPrice } from '@libs/util/prices';
import { Link } from '@remix-run/react';
import { FC } from 'react';

export interface CheckoutOrderSummaryItemsProps {
  cart: Cart;
  name: string;
}

export interface CheckoutOrderSummaryItemProps {
  item: LineItem;
  name: string;
}

export const CheckoutOrderSummaryItem: FC<CheckoutOrderSummaryItemProps> = ({
  item,
  name,
}) => {
  const { cart } = useCart();
  const removeCartItem = useRemoveCartItem();
  const isRemovingFromCart = ['loading', 'submitting'].includes(
    removeCartItem.state
  );

  if (!cart) return null;

  return (
    <li className="flex px-4 py-6 sm:px-6">
      <div className="flex-shrink-0">
        <Image
          src={item.thumbnail || ''}
          alt={`${item.title} thumbnail`}
          className="w-20 rounded-md"
        />
      </div>

      <div className="ml-6 flex flex-1 flex-col">
        <div className="flex">
          <div className="min-w-0 flex-1">
            <h4 className="text-base">
              {!!item.variant?.product && (
                <Link
                  to={`/products/${item.variant.product.handle}`}
                  className="font-bold text-gray-700 hover:text-gray-800"
                >
                  {item.title}
                </Link>
              )}
              {!item.variant_id && (
                <div className="font-bold text-gray-700 hover:text-gray-800">
                  {item.title}
                </div>
              )}
            </h4>
            {!!item.variant && (
              <p className="mt-0.5 text-sm text-gray-500">
                {item.variant?.title}
              </p>
            )}
            {item.variant?.product?.customer_response_prompt && (
              <>
                <p className="mt-1.5 text-xs font-bold text-gray-500">
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

          <div className="ml-4 flow-root flex-shrink-0">
            <Button
              variant="link"
              onClick={() => removeCartItem.submit(item)}
              disabled={isRemovingFromCart}
              className="text-sm"
            >
              {isRemovingFromCart ? 'Removing' : 'Remove'}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 items-end justify-between pt-2">
          <div className="mr-4">
            <LineItemQuantitySelect formId={`quantity-${name}`} item={item} />
          </div>

          <p className="mt-1 text-lg">
            <span className="font-bold text-gray-900">
              {formatPrice(item.unit_price, {
                currency: cart.region?.currency_code,
              })}
            </span>
          </p>
        </div>
      </div>
    </li>
  );
};

export const CheckoutOrderSummaryItems: FC<CheckoutOrderSummaryItemsProps> = ({
  cart,
  name,
}) => (
  <ul role="list" className="divide-y divide-gray-200">
    {cart.items?.map(item => (
      <CheckoutOrderSummaryItem key={item.id} item={item} name={name} />
    ))}
  </ul>
);

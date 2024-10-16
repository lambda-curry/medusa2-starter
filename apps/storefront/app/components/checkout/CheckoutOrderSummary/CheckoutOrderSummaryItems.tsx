import { Button } from '@app/components/common/buttons/Button';
import { Image } from '@app/components/common/images/Image';
import { LineItemQuantitySelect } from '@app/components/cart/line-items/LineItemQuantitySelect';
import { useRemoveCartItem } from '@app/hooks/useRemoveCartItem';
import { formatPrice } from '@libs/util/prices';
import { Link } from '@remix-run/react';
import { FC } from 'react';
import { StoreCart, StoreCartLineItem } from '@medusajs/types';
import { useCheckout } from '@app/hooks/useCheckout';

export interface CheckoutOrderSummaryItemsProps {
  cart: StoreCart;
  name: string;
}

export interface CheckoutOrderSummaryItemProps {
  item: StoreCartLineItem;
  name: string;
}

export const CheckoutOrderSummaryItem: FC<CheckoutOrderSummaryItemProps> = ({ item, name }) => {
  const { cart } = useCheckout();
  const removeCartItem = useRemoveCartItem();
  const handleRemoveFromCart = () => removeCartItem.submit(item);
  const isRemovingFromCart = ['loading', 'submitting'].includes(removeCartItem.state);

  if (!cart) return null;

  return (
    <li className="flex px-4 py-6 sm:px-6">
      <div className="flex-shrink-0">
        <Image
          src={item.variant?.product?.thumbnail || ''}
          alt={item.product_title || 'product thumbnail'}
          className="w-20 rounded-md"
        />
      </div>

      <div className="ml-6 flex flex-1 flex-col">
        <div className="flex">
          <div className="min-w-0 flex-1">
            <h4 className="text-base">
              <Link to={`/products/${item.product_handle}`} className="font-bold text-gray-700 hover:text-gray-800">
                {item.product_title}
              </Link>
            </h4>
            <p className="mt-0.5 text-sm text-gray-500">{item.variant_title}</p>
          </div>

          <div className="ml-4 flow-root flex-shrink-0">
            <Button variant="link" onClick={handleRemoveFromCart} disabled={isRemovingFromCart} className="text-sm">
              {isRemovingFromCart ? 'Removing' : 'Remove'}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 items-end justify-between pt-2">
          <div className="mr-4">
            <LineItemQuantitySelect formId={`quantity-${name}-${item.id}`} item={item} />
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

export const CheckoutOrderSummaryItems: FC<CheckoutOrderSummaryItemsProps> = ({ cart, name }) => (
  <ul role="list" className="divide-y divide-gray-200">
    {cart.items?.map((item) => (
      <CheckoutOrderSummaryItem key={item.id} item={item} name={name} />
    ))}
  </ul>
);

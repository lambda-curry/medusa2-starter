import { formatLineItemPrice } from '@libs/util/prices';
import clsx from 'clsx';
import type { FC } from 'react';
import { useRemoveCartItem } from '../hooks/useRemoveCartItem';
import { Button } from '@components/buttons/Button';
import { Image } from '@components/images/Image';
import { LineItem } from '@libs/util/medusa';

export interface CartDrawerItemProps {
  item: LineItem;
  currencyCode: string;
  isRemoving?: boolean;
}

export const CartDrawerItem: FC<CartDrawerItemProps> = ({
  item,
  currencyCode,
  isRemoving,
}) => {
  const removeCartItem = useRemoveCartItem();
  const handleRemoveFromCart = () => removeCartItem.submit(item);

  return (
    <li
      key={item.id}
      className={clsx('flex h-36 py-6 opacity-100 transition-all', {
        '!h-0 !p-0 !opacity-0': isRemoving,
      })}
    >
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <Image
          src={item.thumbnail || ''}
          alt={item.description || 'product thumbnail'}
          proxyOptions={{ context: 'tiny_square' }}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-0.5 text-sm text-gray-500">
                {item.variant?.title}
              </p>
            </div>
            <Button
              variant="link"
              onClick={handleRemoveFromCart}
              disabled={isRemoving}
              className="text-sm"
            >
              {isRemoving ? 'Removing' : 'Remove'}
            </Button>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center justify-between">
          <p className="text-sm  text-gray-500">Qty {item.quantity}</p>

          <div className="flex">
            <p className="ml-4">{formatLineItemPrice(item, currencyCode)}</p>
          </div>
        </div>
      </div>
    </li>
  );
};

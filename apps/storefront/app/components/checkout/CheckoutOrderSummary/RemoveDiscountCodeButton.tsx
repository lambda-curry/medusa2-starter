import { FC } from 'react';
import { useFetcher } from '@remix-run/react';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { PromotionDTO, StoreCart } from '@medusajs/types';
// import { CartDiscountAction } from "@app/routes/api.cart.discounts"

export interface RemoveDiscountCodeButtonProps {
  cart: StoreCart;
  promotion: PromotionDTO;
}

export const RemovePromotionCodeButton: FC<RemoveDiscountCodeButtonProps> = ({ cart, promotion }) => {
  const fetcher = useFetcher<{}>();

  if (['submitting', 'loading'].includes(fetcher.state)) return null;

  return (
    <fetcher.Form method="post" action="/api/cart/discounts">
      <input type="hidden" name="subaction" value={'deleteItem'} />
      <input type="hidden" name="cartId" value={cart.id} />
      <input type="hidden" name="code" value={promotion.code} />

      <button className="focus:ring-primary-100 focus:border-primary-100 inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-2 text-xs font-bold text-gray-900 shadow-sm hover:bg-gray-100">
        <span>{promotion.code}</span>
        <div className="ml-[4px] inline-block text-gray-400">
          <XMarkIcon className="inline-block h-4 w-4 leading-none" />
        </div>
      </button>
    </fetcher.Form>
  );
};

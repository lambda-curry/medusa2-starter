import { useFetchers } from '@remix-run/react';
import { useRootLoaderData } from './useRootLoaderData';
import { useStorefront } from './useStorefront';
import { StoreCart } from '@medusajs/types';

export const useCart = () => {
  const { state, actions } = useStorefront();
  const data = useRootLoaderData();
  const fetchers = useFetchers();
  const cartFetchers = fetchers.filter((f) => f.data?.cart);
  const removingLineItemFetchers = fetchers.filter(
    (f) => f.formData?.get('subaction') === 'deleteItem' && f.formData?.get('lineItemId'),
  );

  let cart = data?.cart as StoreCart | undefined;

  let isAddingItem = false;
  let isRemovingItemId;
  const cartFetcher = cartFetchers[cartFetchers.length - 1];
  const removingLineItemFetcher = removingLineItemFetchers[removingLineItemFetchers.length - 1];

  if (cartFetcher && cartFetcher.formMethod === 'POST' && ['loading', 'submitting'].includes(cartFetcher.state))
    isAddingItem = true;

  if (removingLineItemFetcher && ['loading', 'submitting'].includes(removingLineItemFetcher.state))
    isRemovingItemId = removingLineItemFetcher.formData?.get('lineItemId');

  return {
    cart,
    isAddingItem,
    isRemovingItemId,
    cartDrawerOpen: state.cart.open,
    toggleCartDrawer: actions.toggleCartDrawer,
  };
};

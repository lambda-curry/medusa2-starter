import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { useSendEvent } from '../../util/analytics/useAnalytics';
import { useCart } from './useCart';
import { Cart, LineItem } from '@libs/util/medusa';

export const useRemoveCartItem = (callback?: () => void) => {
  const fetcher = useFetcher<{ cart: Cart }>();
  const { cart } = useCart();
  const sendRemoveFromCartEvent = useSendEvent('remove_from_cart');

  const submit = ({ id: lineItemId, cart_id: cartId }: LineItem) => {
    fetcher.submit(
      { lineItemId, cartId, subaction: 'deleteItem' },
      { method: 'delete', action: '/api/cart/line-items' }
    );
  };

  useEffect(() => {
    if (fetcher.data?.cart && cart) {
      sendRemoveFromCartEvent({
        updatedCart: fetcher.data.cart,
        previousCart: cart
      });
      callback?.();
    }
  }, [fetcher.data]);

  return { fetcher, state: fetcher.state, submit };
};

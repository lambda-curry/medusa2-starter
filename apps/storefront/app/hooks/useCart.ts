import { useFetchers } from '@remix-run/react';
import { useRootLoaderData } from './useRootLoaderData';
import { useStorefront } from './useStorefront';
import { StoreCart } from '@medusajs/types';
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Enhanced useCart hook that combines cart data management and drawer state logic
 * Following Remix patterns for state management
 * @returns Cart data, state, and methods for managing the cart drawer
 */
export const useCart = () => {
  const { state, actions } = useStorefront();
  const data = useRootLoaderData();
  const fetchers = useFetchers();

  // Simplified cart drawer state
  const [isRemovingLastItem, setIsRemovingLastItem] = useState(false);

  // Refs for timers and state tracking
  const timerRef = useRef<number | null>(null);
  const prevItemCountRef = useRef<number>(0);

  // Track cart-related fetchers
  const cartFetchers = {
    // Find any fetcher that's removing items from cart
    removing: fetchers.find(
      (f) =>
        (f.state === 'submitting' || f.state === 'loading') &&
        f.formData?.get('subaction') === 'deleteItem' &&
        f.formData?.get('lineItemId'),
    ),

    // Find any fetcher that's adding items to cart
    adding: fetchers.filter(
      (f) =>
        (f.state === 'submitting' || f.state === 'loading') &&
        (f.formData?.get('action') === 'add-to-cart' ||
          f.formData?.has('variantId') ||
          (f.formAction?.includes('/api/cart/line-items') && f.formData?.get('subaction') === 'create')),
    ),
  };

  // Get cart data
  const cart = data?.cart as StoreCart | undefined;
  const lineItems = cart?.items || [];
  const itemCount = lineItems.length;

  // Derived states from Remix fetchers
  const isAddingItem = cartFetchers.adding.length > 0;
  const isRemovingItemId = cartFetchers.removing?.formData?.get('lineItemId') as string | undefined;

  // Check if we're removing the last item - improved logic
  const isLastItemBeingRemoved =
    isRemovingItemId &&
    ((itemCount === 1 && isRemovingItemId === lineItems[0]?.id) ||
      (itemCount === 0 && prevItemCountRef.current === 1 && cartFetchers.removing));

  // Helper to clear any existing timer
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Toggle cart drawer with enhanced behavior
  const toggleCartDrawer = useCallback(
    (open: boolean) => {
      // Only update if the state is actually changing
      if (open !== !!state.cart.open) {
        actions.toggleCartDrawer(open);

        if (!open) {
          setIsRemovingLastItem(false);
        }
      }
    },
    [actions, state.cart.open],
  );

  // Effect: Handle cart state transitions
  useEffect(() => {
    clearTimer();

    const cartDrawerOpen = !!state.cart.open;

    // Track if we're removing the last item
    if (isLastItemBeingRemoved && !isRemovingLastItem) {
      setIsRemovingLastItem(true);

      // When removing the last item, set a timer to close the drawer
      if (cartDrawerOpen) {
        timerRef.current = window.setTimeout(() => {
          actions.toggleCartDrawer(false);
          setIsRemovingLastItem(false);
        }, 1500);
      }
    }

    // Keep track of previous item count
    prevItemCountRef.current = itemCount;

    return clearTimer;
  }, [state.cart.open, itemCount, isLastItemBeingRemoved, isRemovingLastItem, actions, clearTimer]);

  // Reset the removing last item state when the cart is closed or when items are added
  useEffect(() => {
    if (!state.cart.open || isAddingItem) {
      setIsRemovingLastItem(false);
    }
  }, [state.cart.open, isAddingItem]);

  // Clean up on unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  // Derived UI states - improved logic to prevent false empty states
  const showEmptyCartMessage = !isAddingItem && itemCount === 0 && !isRemovingLastItem;

  // Ensure cartDrawerOpen is always a boolean
  const cartDrawerOpen = state.cart.open === true;

  return {
    cart,
    isAddingItem,
    isRemovingItemId,
    isRemovingLastItem,
    cartDrawerOpen,
    toggleCartDrawer,
    showEmptyCartMessage,
  };
};

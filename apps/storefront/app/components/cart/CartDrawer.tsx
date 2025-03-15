import { FC, useCallback, useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { formatCartSubtotal, formatPrice } from '@libs/util/prices';
import { useCart } from '@app/hooks/useCart';
import { IconButton } from '@app/components/common/buttons/IconButton';
import { ButtonLink } from '@app/components/common/buttons/ButtonLink';
import { Button } from '@app/components/common/buttons/Button';
import { useNavigate, useFetchers } from '@remix-run/react';
import { useRegion } from '@app/hooks/useRegion';
import { CartDrawerItem } from './CartDrawerItem';
import clsx from 'clsx';

// Cart Drawer Header Component
const CartDrawerHeader: FC<{ itemCount: number; onClose: () => void }> = ({ itemCount, onClose }) => (
  <div className="flex items-start justify-between">
    <DialogTitle className="text-lg font-bold text-gray-900">
      My Cart{' '}
      {itemCount > 0 && (
        <span className="pl-2">
          ({itemCount} item{itemCount > 1 ? 's' : ''})
        </span>
      )}
    </DialogTitle>
    <div className="ml-3 flex h-7 items-center">
      <IconButton icon={XMarkIcon} onClick={onClose} className="-m-2" aria-label="Close panel" />
    </div>
  </div>
);

// Cart Drawer Empty Component
const CartDrawerEmpty: FC = () => <p className="text-center text-sm text-gray-500">Looks like your cart is empty!</p>;

// Cart Drawer Loading Component
const CartDrawerLoading: FC<{ className?: string }> = ({ className }) => (
  <li className={clsx('list-none', className)}>
    <div className="flex animate-pulse space-x-4">
      <div className="h-24 w-24 rounded-md bg-slate-300" />
      <div className="flex h-24 w-full flex-1 flex-col space-y-3 py-1">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-2 rounded bg-slate-300" />
          <div className="col-span-1 h-2 rounded bg-slate-300" />
        </div>
        <div className="h-2 rounded bg-slate-300" />
        <div className="flex-1" />
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1 h-2 rounded bg-slate-300" />
          <div className="col-span-2" />
          <div className="col-span-1 h-2 rounded bg-slate-300" />
        </div>
      </div>
    </div>
  </li>
);

// Cart Drawer Items Component
const CartDrawerItems: FC<{
  items: any[];
  isRemovingItemId?: string;
  currencyCode: string;
}> = ({ items, isRemovingItemId, currencyCode }) => (
  <ul className="-my-6 divide-y divide-gray-200 list-none">
    {items.map((item) => (
      <CartDrawerItem key={item.id} isRemoving={isRemovingItemId === item.id} item={item} currencyCode={currencyCode} />
    ))}
  </ul>
);

// Cart Drawer Content Component
const CartDrawerContent: FC<{
  items: any[];
  isRemovingItemId?: string;
  isAddingItem: boolean;
  showEmptyCartMessage: boolean;
  isRemovingLastItem: boolean;
  currencyCode: string;
}> = ({ items, isRemovingItemId, isAddingItem, showEmptyCartMessage, isRemovingLastItem, currencyCode }) => {
  // Ensure we're correctly determining when to show items vs empty message
  const hasItems = items && items.length > 0;

  return (
    <div className="mt-8">
      <div className="flow-root">
        {/* Show items when there are items in the cart */}
        {hasItems && <CartDrawerItems items={items} isRemovingItemId={isRemovingItemId} currencyCode={currencyCode} />}

        {/* Show loading item when adding items */}
        {isAddingItem && <CartDrawerLoading className={clsx(hasItems ? 'pt-10' : 'py-0')} />}

        {/* Only show empty cart message when cart is truly empty and not loading */}
        {!hasItems && !isAddingItem && <CartDrawerEmpty />}
      </div>
    </div>
  );
};

// Cart Drawer Footer Component
const CartDrawerFooter: FC<{
  navigatingToCheckout: boolean;
  cart: any;
  currencyCode: string;
  itemCount: number;
  onCheckout: () => void;
  onClose: () => void;
}> = ({ cart, currencyCode, itemCount, navigatingToCheckout, onCheckout, onClose }) => (
  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
    <div className="flex justify-between text-base font-bold text-gray-900">
      <p>Subtotal</p>
      <p>
        {cart
          ? formatCartSubtotal(cart)
          : formatPrice(0, {
              currency: currencyCode,
            })}
      </p>
    </div>
    <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
    <div className="mt-6">
      <Button
        variant="primary"
        disabled={itemCount === 0 || navigatingToCheckout}
        onClick={onCheckout}
        className="h-12 w-full !text-base font-bold"
      >
        {navigatingToCheckout ? 'Preparing checkout...' : 'Checkout'}
      </Button>
    </div>
    <div className="mt-4 flex justify-center text-center text-sm text-gray-500">
      <p>
        or{' '}
        <ButtonLink size="sm" onClick={onClose}>
          <div>
            Continue Shopping{` `}
            <span aria-hidden="true">&rarr;</span>
          </div>
        </ButtonLink>
      </p>
    </div>
  </div>
);

export const CartDrawer: FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartDrawerOpen,
    toggleCartDrawer,
    isAddingItem,
    isRemovingItemId,
    isRemovingLastItem,
    showEmptyCartMessage,
  } = useCart();
  const { region } = useRegion();
  const allFetchers = useFetchers();
  const [navigatingToCheckout, setNavigatingToCheckout] = useState(false);

  // Track if any cart-related fetchers are active
  const isCartLoading = allFetchers.some(
    (f) =>
      (f.state === 'submitting' || f.state === 'loading') &&
      (f.formAction?.includes('/api/cart') || f.formData?.get('action') === 'add-to-cart'),
  );

  // Local state to control the dialog - initialize with cartDrawerOpen
  const [isOpen, setIsOpen] = useState(false);

  // Sync our local state with the cart drawer state
  useEffect(() => {
    setIsOpen(cartDrawerOpen === true);
  }, [cartDrawerOpen]);

  const lineItems = cart?.items ?? [];
  const lineItemsTotal = lineItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutClick = useCallback(() => {
    setNavigatingToCheckout(true);
    navigate('/checkout');
    setTimeout(() => {
      toggleCartDrawer(false);
      setNavigatingToCheckout(false);
    }, 750);
  }, [navigate, toggleCartDrawer]);

  const handleClose = useCallback(() => {
    toggleCartDrawer(false);
  }, [toggleCartDrawer]);

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop with transition */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-300 bg-opacity-50 backdrop-blur-sm duration-300 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            {/* Panel with transition */}
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform duration-500 ease-in-out data-[closed]:translate-x-full"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <CartDrawerHeader itemCount={lineItemsTotal} onClose={handleClose} />

                  <CartDrawerContent
                    items={lineItems}
                    isRemovingItemId={isRemovingItemId}
                    isAddingItem={isAddingItem || isCartLoading}
                    showEmptyCartMessage={showEmptyCartMessage}
                    isRemovingLastItem={isRemovingLastItem}
                    currencyCode={region.currency_code}
                  />
                </div>

                {/* Footer */}
                <CartDrawerFooter
                  navigatingToCheckout={navigatingToCheckout}
                  cart={cart}
                  currencyCode={region.currency_code}
                  itemCount={lineItemsTotal}
                  onCheckout={handleCheckoutClick}
                  onClose={handleClose}
                />
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

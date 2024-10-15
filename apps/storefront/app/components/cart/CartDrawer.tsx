import { FC, Fragment, PropsWithChildren, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { CartDrawerItem } from './CartDrawerItem';
import { formatCartSubtotal, formatPrice } from '@libs/util/prices';
import { useCart } from '@app/hooks/useCart';
import { IconButton } from '@app/components/common/buttons/IconButton';
import { ButtonLink } from '@app/components/common/buttons/ButtonLink';
import { Button } from '@app/components/common/buttons/Button';
import { useNavigate } from '@remix-run/react';
import { useRegion } from '@app/hooks/useRegion';

export const CartDrawer: FC<PropsWithChildren> = () => {
  const navigate = useNavigate();
  const { cart, cartDrawerOpen, toggleCartDrawer, isAddingItem, isRemovingItemId } = useCart();
  const { region } = useRegion();
  let lineItems = cart?.items ?? [];
  let lineItemsCount = lineItems.length;
  const lineItemsTotal = lineItems.reduce((acc, item) => acc + item.quantity, 0);
  const isRemovingLastItem = lineItems.length === 1 && isRemovingItemId === lineItems[0].id;

  const handleCheckoutClick = () => {
    navigate('/checkout');
    toggleCartDrawer();
  };

  useEffect(() => {
    if (lineItemsCount < 1 || isRemovingLastItem) toggleCartDrawer(false);
  }, [lineItemsCount]);

  return (
    <Transition.Root show={!!cartDrawerOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => toggleCartDrawer(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-300 bg-opacity-50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-200"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-bold text-gray-900">
                          My Cart{' '}
                          {lineItemsTotal > 0 && (
                            <span className="pl-2">
                              ({lineItemsTotal} item
                              {lineItemsTotal > 1 ? 's' : ''})
                            </span>
                          )}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <IconButton
                            icon={XMarkIcon}
                            onClick={() => toggleCartDrawer(false)}
                            className="-m-2"
                            aria-label="Close panel"
                          />
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          {((!isAddingItem && lineItems.length === 0) || isRemovingLastItem) && (
                            <p className="text-center text-sm text-gray-500">Looks like your cart is empty!</p>
                          )}

                          <ul className="-my-6 divide-y divide-gray-200">
                            {lineItems.map((item) => {
                              const isRemoving = isRemovingItemId === item.id;
                              return (
                                <CartDrawerItem
                                  key={item.id}
                                  isRemoving={isRemoving}
                                  item={item}
                                  currencyCode={region.currency_code}
                                />
                              );
                            })}

                            {isAddingItem && (
                              <li className="py-6">
                                <div className="flex animate-pulse space-x-4">
                                  <div className="h-24 w-24  rounded-md bg-slate-300" />
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
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <div className="flex justify-between text-base font-bold text-gray-900">
                        <p>Subtotal</p>
                        <p>
                          {cart
                            ? formatCartSubtotal(cart)
                            : formatPrice(0, {
                                currency: region.currency_code,
                              })}
                        </p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                      <div className="mt-6">
                        <Button
                          variant="primary"
                          disabled={lineItems.length === 0}
                          onClick={handleCheckoutClick}
                          className="h-12 w-full !text-base font-bold"
                        >
                          Checkout
                        </Button>
                      </div>
                      <div className="mt-4 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          or{' '}
                          <ButtonLink size="sm" onClick={() => toggleCartDrawer(false)}>
                            <div>
                              Continue Shopping{` `}
                              <span aria-hidden="true">&rarr;</span>
                            </div>
                          </ButtonLink>
                        </p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

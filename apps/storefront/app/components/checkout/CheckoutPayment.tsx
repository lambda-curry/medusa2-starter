import { FC, useMemo } from 'react';
import { Tab } from '@headlessui/react';
import { StripePayment } from './StripePayment';
import { ManualPayment } from './ManualPayment/ManualPayment';
import clsx from 'clsx';
import { useCheckout } from '@ui-components/hooks/useCheckout';
import { useCart } from '@ui-components/hooks/useCart';
import { CheckoutStep } from '@ui-components/providers/checkout-provider';
import { Button } from '@components/buttons/Button';

export const CheckoutPayment: FC = () => {
  const { step, paymentMethods } = useCheckout();
  const { cart } = useCart();
  const isActiveStep = step === CheckoutStep.PAYMENT;

  if (!cart) return null;

  const hasStripePaymentProvider = useMemo(
    () => !!cart.region?.payment_providers?.some(p => p.id.includes('stripe')),
    [cart.region?.payment_providers]
  );

  const hasManualPaymentProvider = useMemo(
    () => !!cart.region?.payment_providers?.some(p => p.id.includes('manual')),
    [cart.region?.payment_providers]
  );

  const paymentOptions = [
    {
      id: 'stripe',
      label: 'Credit Card',
      component: StripePayment,
      isActive: hasStripePaymentProvider,
    },
    {
      id: 'manual',
      label: 'Manual',
      component: ManualPayment,
      isActive: hasManualPaymentProvider,
    },
  ];

  const activePaymentOptions = useMemo(
    () => paymentOptions.filter(p => p.isActive),
    [paymentOptions]
  );

  return (
    <div className="checkout-payment">
      <div className={clsx({ 'h-0 overflow-hidden opacity-0': !isActiveStep })}>
        <Tab.Group>
          {activePaymentOptions.length > 1 && (
            <Tab.List className="bg-primary-50 mb-2 mt-6 inline-flex gap-0.5 rounded-full p-2">
              {activePaymentOptions.map((paymentOption, index) => (
                <Tab
                  as={Button}
                  key={paymentOption.id}
                  className={({ selected }) =>
                    clsx('!rounded-full', {
                      '!bg-white !text-gray-700 shadow-sm': selected,
                      '!bg-primary-50 !border-primary-100 !text-primary-600 hover:!text-primary-800 hover:!bg-primary-100 !border-none':
                        !selected,
                    })
                  }
                >
                  {paymentOption.label}
                </Tab>
              ))}
            </Tab.List>
          )}

          <Tab.Panels>
            {activePaymentOptions.map(paymentOption => {
              const PaymentComponent = paymentOption.component;

              return (
                <Tab.Panel key={paymentOption.id}>
                  <PaymentComponent
                    isActiveStep={isActiveStep}
                    paymentMethods={paymentMethods}
                  />
                </Tab.Panel>
              );
            })}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

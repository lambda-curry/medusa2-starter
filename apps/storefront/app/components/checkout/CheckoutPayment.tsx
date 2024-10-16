import { FC, useMemo } from 'react';
import { Tab } from '@headlessui/react';
import { StripePayment } from './StripePayment';
import { ManualPayment } from './ManualPayment/ManualPayment';
import clsx from 'clsx';
import { useCheckout } from '@app/hooks/useCheckout';
import { CheckoutStep } from '@app/providers/checkout-provider';
import { Button } from '@app/components/common/buttons/Button';
import { CustomPaymentSession } from '@libs/types';
import { useEnv } from '@app/hooks/useEnv';

export const CheckoutPayment: FC = () => {
  const { env } = useEnv();
  const { step, paymentProviders, cart } = useCheckout();
  const isActiveStep = step === CheckoutStep.PAYMENT;

  if (!cart) return null;

  const hasStripePaymentProvider = useMemo(
    () => paymentProviders?.some((p) => p.id.includes('pp_stripe_stripe')),
    [paymentProviders],
  );

  const hasManualPaymentProvider = useMemo(
    () => !!paymentProviders?.some((p) => p.id.includes('pp_system_default')),
    [paymentProviders],
  );

  const paymentOptions = [
    {
      id: 'pp_stripe_stripe',
      label: 'Credit Card',
      component: StripePayment,
      isActive: hasStripePaymentProvider,
    },
    {
      id: 'pp_system_default',
      label: 'Test Payment',
      component: ManualPayment,
      isActive: hasManualPaymentProvider && env.NODE_ENV === 'development',
    },
  ];

  const activePaymentOptions = useMemo(() => paymentOptions.filter((p) => p.isActive), [paymentOptions]);

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
            {activePaymentOptions.map((paymentOption) => {
              const PaymentComponent = paymentOption.component;

              return (
                <Tab.Panel key={paymentOption.id}>
                  <PaymentComponent isActiveStep={isActiveStep} paymentMethods={[] as CustomPaymentSession[]} />
                </Tab.Panel>
              );
            })}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

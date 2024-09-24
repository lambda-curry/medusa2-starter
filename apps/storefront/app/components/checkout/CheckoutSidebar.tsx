import { FC } from 'react';
import clsx from 'clsx';
import { CheckoutOrderSummary } from './CheckoutOrderSummary';
import { useCheckout } from '@ui-components/hooks/useCheckout';
import { CheckoutStep } from '@ui-components/providers/checkout-provider';

export const CheckoutSidebar: FC = () => {
  const { step } = useCheckout();

  return (
    <div
      className={clsx('h-full', {
        'hidden lg:block': step === CheckoutStep.PAYMENT,
      })}
    >
      <div className="sticky top-24">
        <CheckoutOrderSummary name="sidebar" />
      </div>
    </div>
  );
};

import { FC, PropsWithChildren } from 'react';
import { CustomPaymentSession } from '@libs/types';
import { CompleteCheckoutForm } from '../CompleteCheckoutForm';

export interface ManualPaymentProps extends PropsWithChildren {
  isActiveStep: boolean;
  paymentMethods: CustomPaymentSession[];
}

export const ManualPayment: FC<ManualPaymentProps> = (props) => (
  <CompleteCheckoutForm
    providerId="pp_system_default"
    id="TestPaymentForm"
    submitMessage="Checkout using Test Payment"
    className="mt-4"
    {...props}
  />
);

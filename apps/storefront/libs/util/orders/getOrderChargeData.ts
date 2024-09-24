import { CreditCardBrand, Payment } from '../../../../markethaus/utils/types';
import { PaymentMethod } from '@stripe/stripe-js';

export interface PaymentMethodDetails {
  type: 'card';
  card?: {
    brand: CreditCardBrand;
    last4: PaymentMethod.Card['last4'];
    exp_month: PaymentMethod.Card['exp_month'];
    exp_year: PaymentMethod.Card['exp_year'];
  };
}

export const getOrderPaymentData = (payments: Payment[]): PaymentMethodDetails | null => {
  const payment = payments.filter(p => p.provider_id === 'stripe')[0];
  if (!payment) return null;

  if (payment.data.payment_method?.type === 'card') {
    return { type: 'card', card: payment.data.payment_method.card as PaymentMethodDetails['card'] };
  }

  if (payment.data.charges?.data?.length) {
    return {
      type: 'card',
      card: payment.data.charges.data[0].payment_method_details.card
    };
  }

  return null;
};

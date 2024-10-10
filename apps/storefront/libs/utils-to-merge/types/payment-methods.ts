import { PaymentMethod as StripePaymentMethod } from '@stripe/stripe-js';

export interface ModifiedStripePaymentMethod
  extends Pick<
    StripePaymentMethod,
    'id' | 'object' | 'billing_details' | 'card' | 'created' | 'customer' | 'livemode' | 'metadata' | 'type'
  > {}

export interface PaymentMethod {
  provider_id: string;
  data: ModifiedStripePaymentMethod;
}

export type PaymentMethods = PaymentMethod[];

export type CreditCardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'diners' | 'unionpay' | 'unknown';

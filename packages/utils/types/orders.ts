import { Order as MedusaOrder, Payment as MedusaPayment } from '@medusajs/medusa';
import { PaymentMethod } from '@stripe/stripe-js';
import { CreditCardBrand } from './payment-methods';

export interface Payment extends Omit<MedusaPayment, 'data' | 'beforeInsert'> {
  data: {
    payment_method?: PaymentMethod;
    charges?: {
      data: {
        billing_details: PaymentMethod.BillingDetails;
        payment_method_details: {
          type: string;
          card: Omit<PaymentMethod.Card, 'brand'> & { brand: CreditCardBrand };
        };
      }[];
    };
  };
}

export interface Order extends Omit<MedusaOrder, 'payments'> {
  payments: Payment[];
}

import {
  BasePayment,
  BasePaymentSession,
} from '@medusajs/types/dist/http/payment/common'
import { PaymentMethod as StripePaymentMethod } from '@stripe/stripe-js'

export interface ModifiedStripePaymentMethod
  extends Pick<
    StripePaymentMethod,
    | 'id'
    | 'object'
    | 'billing_details'
    | 'card'
    | 'created'
    | 'customer'
    | 'livemode'
    | 'metadata'
    | 'type'
  > {}

export interface CustomPaymentSession extends BasePaymentSession {
  provider_id: string
  data: ModifiedStripePaymentMethod
}

export type CreditCardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'jcb'
  | 'diners'
  | 'unionpay'
  | 'unknown'

export interface PaymentMethod extends BasePayment {
  data: ModifiedStripePaymentMethod
}

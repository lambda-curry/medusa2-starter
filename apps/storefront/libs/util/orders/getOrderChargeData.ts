import { CreditCardBrand, Payment } from '@libs/utils-to-merge/types'
import { StoreOrder, StorePaymentCollection } from '@medusajs/types'
import { BasePayment } from '@medusajs/types/dist/http/payment/common'
import { PaymentMethod as StripePaymentMethod } from '@stripe/stripe-js'
import { PaymentMethod } from '@libs/utils-to-merge/types'

export interface PaymentMethodDetails {
  type: 'card'
  card?: {
    brand: CreditCardBrand
    last4: StripePaymentMethod.Card['last4']
    exp_month: StripePaymentMethod.Card['exp_month']
    exp_year: StripePaymentMethod.Card['exp_year']
  }
}

export const getOrderPaymentData = (
  payments: BasePayment[],
): PaymentMethodDetails | null => {
  const payment = payments.filter((p) => p.provider_id === 'stripe')[0]
  if (!payment) return null

  // const { data } = payment as PaymentMethod
  // if (data?.payment_method?.type === 'card') {
  //   return {
  //     type: 'card',
  //     card: data?.payment_method.card as PaymentMethodDetails['card'],
  //   }
  // }

  // if (data?.charges?.data?.length) {
  //   return {
  //     type: 'card',
  //     card: data?.charges.data[0].payment_method_details.card,
  //   }
  // }

  return null
}

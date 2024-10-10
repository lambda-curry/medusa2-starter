import { FC, PropsWithChildren } from "react"
import { type PaymentMethods } from "@libs/utils-to-merge/types"
import { CompleteCheckoutForm } from "../CompleteCheckoutForm"

export interface ManualPaymentProps extends PropsWithChildren {
  isActiveStep: boolean
  paymentMethods: PaymentMethods
}

export const ManualPayment: FC<ManualPaymentProps> = (props) => (
  <CompleteCheckoutForm
    providerId="manual"
    id="TestPaymentForm"
    submitMessage="Checkout using Test Payment"
    className="mt-4"
    {...props}
  />
)

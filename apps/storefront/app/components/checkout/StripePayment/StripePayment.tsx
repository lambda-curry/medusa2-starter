import type { FC, PropsWithChildren } from "react"
import type { PaymentMethods } from "@libs/utils-to-merge/types"
import { StripeElementsProvider } from "./StripeElementsProvider"
import { StripePaymentForm } from "./StripePaymentForm"

export interface StripePaymentProps extends PropsWithChildren {
  isActiveStep: boolean
  paymentMethods: PaymentMethods
}

export const StripePayment: FC<StripePaymentProps> = (props) => {
  const { isActiveStep, ...rest } = props
  return (
    <StripeElementsProvider>
      <StripePaymentForm {...rest} isActiveStep={isActiveStep} />
    </StripeElementsProvider>
  )
}

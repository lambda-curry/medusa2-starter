import { FC, FormEvent, PropsWithChildren, useEffect, useState } from "react"
import { SubmitFunction } from "@remix-run/react"
import { useControlField } from "remix-validated-form"
import {
  PaymentMethodCreateParams,
  StripePaymentElement,
} from "@stripe/stripe-js"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import clsx from "clsx"
import { Address, PaymentMethods } from "@libs/utils-to-merge/types"
import { UpdatePaymentInput } from "~/routes/api.checkout"
import { CompleteCheckoutForm } from "../CompleteCheckoutForm"
// import { medusaAddressToAddress } from "@libs/utils-to-merge/addresses"
import { useCart } from "@ui-components/hooks/useCart"
import { Alert } from "@ui-components/common/alert/Alert"
import { useCheckout } from "@ui-components/hooks/useCheckout"
import { BaseCartAddress } from "@medusajs/types/dist/http/cart/common"

export interface StripePaymentFormProps extends PropsWithChildren {
  isActiveStep: boolean
  paymentMethods: PaymentMethods
}

export const StripePaymentForm: FC<StripePaymentFormProps> = ({
  isActiveStep,
  paymentMethods,
}) => {
  const [stripeElement, setStripeElement] = useState<StripePaymentElement>()
  const [stripeError, setStripeError] = useState<string | undefined>()
  const stripe = useStripe()
  const elements = useElements()
  const { cart } = useCart()
  const { activePaymentSession } = useCheckout()

  useEffect(() => {
    if (!elements) return
    elements.fetchUpdates()
  }, [activePaymentSession?.payment?.updated_at]) // TODO: CHECK if this is correct

  const hasPaymentMethods = paymentMethods.length > 0
  const initialPaymentMethodId = hasPaymentMethods
    ? paymentMethods[0].data.id
    : "new"
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useControlField(
    "paymentMethodId",
    "stripePaymentForm",
  )

  useEffect(
    () => setSelectedPaymentMethodId(initialPaymentMethodId),
    [paymentMethods],
  )

  useEffect(() => {
    if (isActiveStep && stripeElement) stripeElement.focus()
  }, [selectedPaymentMethodId, isActiveStep, stripeElement])

  if (!cart || !stripe || !elements) return null

  const handleSubmit = async (
    data: UpdatePaymentInput,
    event: FormEvent<HTMLFormElement>,
    {
      setSubmitting,
      submit,
    }: {
      setSubmitting: (isSubmitting: boolean) => void
      submit: SubmitFunction
    },
  ) => {
    setStripeError(undefined)
    if (data.paymentMethodId !== "new") {
      submit(event.target as HTMLFormElement)
      return
    }
    // NOTE: We default the cart billing address to be the same as the shipping address in the `ACCOUNT_DETAILS` step.
    const address = (
      data.sameAsShipping ? cart.billing_address : data.billingAddress
    ) as BaseCartAddress

    const stripeBillingDetails: PaymentMethodCreateParams.BillingDetails = {
      name: `${address.first_name} ${address.last_name}`,
      email: cart.email,
      phone: address.phone || "",
      address: {
        line1: address.address_1 || "",
        line2: address.address_2 || "",
        city: address.city || "",
        state: address.province || "",
        postal_code: address.postal_code || "",
        country: address.country_code || "",
      },
    }

    setSubmitting(true)

    return stripe
      .confirmPayment({
        //`Elements` instance that was used to create the Payment Element
        elements,
        confirmParams: {
          // return_url: siteURL(redirectPath),
          return_url: "http://localhost:3000/checkout/success",

          // We need to add the billing details manually because we are disabling
          // the billing address fields on the `PaymentElement`
          payment_method_data: { billing_details: stripeBillingDetails },
        },
        redirect: "if_required",
      })
      .then(({ paymentIntent, error }) => {
        if (error) {
          setStripeError(error.message)
          setSubmitting(false)
          stripeElement?.focus()
          return
        }

        submit(event.target as HTMLFormElement)

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Show error to your customer (e.g., payment
        // details incomplete)
        // if (error) return handleError(error);
        // if (!is_default) return handleSuccess(setupIntent);
      })
      .catch((error) => {
        setSubmitting(false)
        console.error(error)
      })
  }

  const handlePaymentElementReady = (element: StripePaymentElement) => {
    setStripeElement(element)
  }

  return (
    <>
      <CompleteCheckoutForm
        providerId="stripe"
        id="stripePaymentForm"
        paymentMethods={paymentMethods}
        onSubmit={handleSubmit}
      >
        <div
          className={clsx({
            "h-0 overflow-hidden opacity-0":
              hasPaymentMethods && initialPaymentMethodId !== "new",
          })}
        >
          <PaymentElement
            onReady={handlePaymentElementReady}
            className="my-6 w-full"
            options={{
              // To disable these fields in the form, we have to pass the billing country at "confirm-time"
              fields: {
                billingDetails: {
                  address: { country: "never", postalCode: "never" },
                },
              },
              terms: { card: "never" },
            }}
          />
          {stripeError && (
            <Alert type="error" className={clsx("form__error -mt-4 mb-2")}>
              {stripeError}
            </Alert>
          )}
        </div>
      </CompleteCheckoutForm>
    </>
  )
}

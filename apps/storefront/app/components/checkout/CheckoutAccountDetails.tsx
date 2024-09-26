import { Actions } from "@components/actions/Actions"
import { Alert } from "@components/alert"
import { Button } from "@components/buttons/Button"
import { ButtonLink } from "@components/buttons/ButtonLink"
import { SubmitButton } from "@components/buttons/SubmitButton"
import { ConfirmPasswordFieldGroup } from "@components/field-groups"
import { Form } from "@components/forms/Form"
import { FormError } from "@components/forms/FormError"
import { FieldGroup } from "@components/forms/fields/FieldGroup"
import { FieldText } from "@components/forms/fields/FieldText"
import { Country } from "@markethaus/storefront-client"
import { emptyAddress, medusaAddressToAddress } from "@utils/addresses"
import { useCart } from "@ui-components/hooks/useCart"
import { useCheckout } from "@ui-components/hooks/useCheckout"
import { useCustomer } from "@ui-components/hooks/useCustomer"
import { useRegions } from "@ui-components/hooks/useRegions"
import { checkAccountDetailsComplete } from "@libs/util/checkout"
import { Region } from "@libs/util/medusa"
import { useFetcher } from "@remix-run/react"
import debounce from "lodash/debounce"
import { useEffect, useRef, useState } from "react"
import { useControlField, useFormContext } from "remix-validated-form"
import {
  CheckoutAction,
  UpdateAccountDetailsInput,
  UpdateContactInfoInput,
} from "~/routes/_todo/api.checkout"
import { useLogin } from "../../../libs/ui-components/hooks/useLogin"
import { CheckoutStep } from "../../../libs/ui-components/providers/checkout-provider"
import { emailAddressValidation } from "../../../libs/util/validation"
import { CheckoutSectionHeader } from "./CheckoutSectionHeader"
import HiddenAddressGroup from "./HiddenAddressGroup"
import {
  MedusaStripeAddress,
  defaultStripeAddress,
  type StripeAddress,
} from "./MedusaStripeAddress/MedusaStripeAddress"
import { AddressDisplay } from "./address/AddressDisplay"
import {
  AddressSuggestionModal,
  AddressSuggestions,
} from "./address/AddressSuggestionModal"
import { ShippingAddressRadioGroup } from "./checkout-fields"
import {
  checkoutAccountDetailsValidator,
  checkoutUpdateContactInfoValidator,
  selectInitialShippingAddressId,
} from "./checkout-form-helpers"

const NEW_SHIPPING_ADDRESS_ID = "new"
export const CheckoutAccountDetails = () => {
  const formRef = useRef<HTMLFormElement>(null)
  const checkoutContactInfoFormFetcher = useFetcher<{}>()
  const checkoutAccountDetailsFormFetcher = useFetcher<{
    fieldErrors: any
    suggestions: AddressSuggestions
  }>()
  const form = useFormContext("checkoutAccountDetailsForm")
  const { cart } = useCart()
  const { customer } = useCustomer()
  const { step, setStep, goToNextStep } = useCheckout()
  const isActiveStep = step === CheckoutStep.ACCOUNT_DETAILS

  if (!cart) return null

  const { regions } = useRegions()
  const allowedCountries = (regions ?? []).flatMap((region: Region) =>
    region.countries!.map((country: Country) => country.iso_2),
  )
  const [newShippingAddress, setNewShippingAddress] = useState<StripeAddress>(
    defaultStripeAddress(),
  )

  const isComplete = checkAccountDetailsComplete(cart)
  const isSubmitting = ["submitting", "loading"].includes(
    checkoutAccountDetailsFormFetcher.state,
  )

  const [addressValidationModalOpen, setAddressValidationModalOpen] =
    useState(false)

  const hasErrors = !!checkoutAccountDetailsFormFetcher.data?.fieldErrors
  const hasSuggestions = !!checkoutAccountDetailsFormFetcher.data?.suggestions
  const isLoggedIn = !!customer?.id

  const hasShippingAddresses: boolean = !!(
    customer?.shipping_addresses && customer?.shipping_addresses.length > 0
  )

  const initialShippingAddressId = selectInitialShippingAddressId(
    cart,
    customer as any,
  )
  const [selectedShippingAddressId, setSelectedShippingAddressId] =
    useControlField("shippingAddressId", "checkoutAccountDetailsForm")

  const { toggleLoginModal } = useLogin()

  const countryOptions =
    cart.region?.countries?.map((country) => ({
      value: country.iso_2,
      label: country.display_name,
    })) ?? []

  const addressWithUserPostalCode = cart.shipping_address
    ? {
        ...cart.shipping_address,
        postal_code: cart.shipping_address.postal_code,
      }
    : null

  const shippingAddress = medusaAddressToAddress(addressWithUserPostalCode)

  const defaultValues = {
    cartId: cart.id,
    email: customer?.email || cart.email || "",
    customerId: customer?.id,
    allowSuggestions: true,
    shippingAddress: {
      ...emptyAddress,
      ...(isLoggedIn ? {} : shippingAddress || {}),
    },
    shippingAddressId: initialShippingAddressId,
  }

  // on load, submit form with default values if there is only one shipping address
  useEffect(() => {
    if (
      !formRef.current ||
      !customer?.shipping_addresses ||
      customer.shipping_addresses.length > 1 ||
      initialShippingAddressId
    )
      return
    const formData = new FormData(formRef.current)
    form.reset()
    checkoutAccountDetailsFormFetcher.submit(formData, {
      method: "post",
      action: "/api/checkout",
    })
  }, [formRef.current])

  useEffect(
    () => setSelectedShippingAddressId(initialShippingAddressId),
    [customer?.shipping_addresses?.length],
  )

  useEffect(() => {
    if (checkoutAccountDetailsFormFetcher.data?.suggestions) {
      setAddressValidationModalOpen(true)
    }
  }, [checkoutAccountDetailsFormFetcher])

  useEffect(() => {
    if (
      isActiveStep &&
      !isSubmitting &&
      !hasErrors &&
      isComplete &&
      !hasSuggestions
    ) {
      setSelectedShippingAddressId(initialShippingAddressId)
      form.reset()
      goToNextStep()
    }
  }, [isSubmitting, isComplete])

  useEffect(() => {
    if (isLoggedIn) setSelectedShippingAddressId(initialShippingAddressId)
  }, [isLoggedIn])

  const handleCancel = () => {
    setSelectedShippingAddressId(initialShippingAddressId)
    goToNextStep()
  }

  const handleEmailChange = debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const isEmailValid = await emailAddressValidation.email.isValid(
        e.target.value,
      )
      if (!isEmailValid) return

      checkoutContactInfoFormFetcher.submit(
        new FormData(e.target.form as HTMLFormElement),
        {
          method: "post",
          action: "/api/checkout",
        },
      )
    },
    500,
    { leading: true },
  )

  const showCompleted = isComplete && !isActiveStep

  return (
    <div className="checkout-account-details">
      <CheckoutSectionHeader
        completed={showCompleted}
        setStep={setStep}
        step={CheckoutStep.ACCOUNT_DETAILS}
      >
        Account details
      </CheckoutSectionHeader>

      {!isActiveStep && isComplete && (
        <AddressDisplay
          title="Shipping Address"
          address={shippingAddress}
          countryOptions={countryOptions}
        />
      )}

      {isActiveStep && (
        <>
          {customer?.email ? (
            <p className="mt-2 text-sm">
              To get started, please select your shipping address.
            </p>
          ) : (
            <p className="mt-2 text-sm">
              To get started, enter your email address or{" "}
              <ButtonLink size="sm" onClick={() => toggleLoginModal()}>
                log in to your account
              </ButtonLink>
              .
            </p>
          )}

          {!customer?.email && (
            <Form<UpdateContactInfoInput, CheckoutAction.UPDATE_CONTACT_INFO>
              id="checkoutContactInfoForm"
              method="post"
              action="/api/checkout"
              fetcher={checkoutContactInfoFormFetcher}
              subaction={CheckoutAction.UPDATE_CONTACT_INFO}
              defaultValues={defaultValues}
              validator={checkoutUpdateContactInfoValidator}
            >
              <FieldText id="accountUpdateEmail" type="hidden" name="cartId" />

              <FieldGroup>
                <FieldText
                  inputProps={{
                    autoFocus: true,
                  }}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  label="Email Address"
                  onChange={handleEmailChange}
                />
              </FieldGroup>

              <FormError />

              {cart.emailExists && (
                <Alert
                  type="default"
                  className="-mt-2 mb-2 text-sm"
                  action={() => (
                    <Button
                      className="whitespace-nowrap"
                      size="sm"
                      onClick={() => toggleLoginModal(true)}
                    >
                      Log in
                    </Button>
                  )}
                >
                  Looks like there is already and account associated with the
                  email "{cart.email}."
                </Alert>
              )}
            </Form>
          )}

          <Form<
            UpdateAccountDetailsInput,
            CheckoutAction.UPDATE_ACCOUNT_DETAILS
          >
            formRef={formRef}
            id="checkoutAccountDetailsForm"
            method="post"
            action="/api/checkout"
            fetcher={checkoutAccountDetailsFormFetcher}
            defaultValues={defaultValues}
            subaction={CheckoutAction.UPDATE_ACCOUNT_DETAILS}
            // @ts-ignore
            validator={checkoutAccountDetailsValidator}
          >
            <FieldText type="hidden" name="cartId" />
            <FieldText type="hidden" name="customerId" />
            <FieldText type="hidden" name="email" value={cart.email ?? ""} />
            <FieldText type="hidden" name="allowSuggestions" />

            <HiddenAddressGroup
              address={newShippingAddress.address}
              prefix="shippingAddress"
            />

            {!hasShippingAddresses && (
              <FieldText
                type="hidden"
                name="shippingAddressId"
                value={NEW_SHIPPING_ADDRESS_ID}
              />
            )}

            <ShippingAddressRadioGroup customer={customer} />

            {(!isLoggedIn ||
              selectedShippingAddressId === "new" ||
              !hasShippingAddresses) && (
              <MedusaStripeAddress
                mode="shipping"
                address={shippingAddress}
                allowedCountries={allowedCountries}
                setAddress={setNewShippingAddress}
              />
            )}

            {!isLoggedIn && !cart.emailExists && (
              <>
                <h2 className="mt-8 text-lg font-bold text-gray-900">
                  Create an account (optional)
                </h2>
                <p className="text-sm text-gray-500">
                  Enter a password to create an account.
                </p>
                <ConfirmPasswordFieldGroup />
              </>
            )}

            <FormError />

            <Actions>
              <SubmitButton
                disabled={
                  isSubmitting ||
                  (!newShippingAddress.completed &&
                    selectedShippingAddressId === "new")
                }
              >
                {isSubmitting ? "Saving..." : "Save and continue"}
              </SubmitButton>

              {isComplete && (
                <Button disabled={isSubmitting} onClick={handleCancel}>
                  Cancel edit
                </Button>
              )}
            </Actions>
            <AddressSuggestionModal
              fetcher={checkoutAccountDetailsFormFetcher}
              suggestions={checkoutAccountDetailsFormFetcher.data?.suggestions}
              isOpen={addressValidationModalOpen}
              onClose={() => setAddressValidationModalOpen(false)}
            />
          </Form>
        </>
      )}
    </div>
  )
}

import { FC, useEffect, useRef } from "react"
import { FetcherWithComponents, useFetcher } from "@remix-run/react"
import { Vendor } from "@libs/util/medusa/types"
import {
  VendorAction,
  VendorContactFormInput,
  vendorContactFormValidator,
} from "~/routes/api.vendors"
import { useCustomer } from "@ui-components/hooks/useCustomer"
import { Alert } from "@ui-components/common/alert"
import { SubmitButton } from "@ui-components/common/buttons"
import { FieldGroup } from "@ui-components/common/forms/fields/FieldGroup"
import { FieldText } from "@ui-components/common/forms/fields/FieldText"
import { FieldTextarea } from "@ui-components/common/forms/fields/FieldTextarea"
import { Form } from "@ui-components/common/forms/Form"

export interface VendorContactFormProps {
  vendor: Vendor
}

export const VendorContactForm: FC<VendorContactFormProps> = ({ vendor }) => {
  const { customer } = useCustomer()
  const formRef = useRef<HTMLFormElement>(null)
  const fetcher = useFetcher<{
    success: boolean
    fieldErrors?: Record<string, string>
  }>() as FetcherWithComponents<{
    success: boolean
    fieldErrors?: Record<string, string>
  }>

  const defaultValues: VendorContactFormInput = {
    vendor_id: vendor.id,
    customer_name: customer
      ? `${customer?.first_name} ${customer?.last_name}`
      : "",
    customer_email: customer?.email || "",
    subject: `MarketHaus Support Request: ${vendor.name}`,
    message: "",
  }

  useEffect(() => {
    if (fetcher.data?.success) {
      formRef.current?.reset()
    }
  }, [fetcher.data])

  return (
    <Form<VendorContactFormInput, VendorAction.CONTACT>
      id="vendorContactForm"
      method="post"
      action="/api/vendors"
      subaction={VendorAction.CONTACT}
      formRef={formRef}
      fetcher={fetcher}
      validator={vendorContactFormValidator}
      defaultValues={defaultValues}
    >
      <input type="hidden" name="vendor_id" value={vendor.id} />

      {fetcher.data?.success && (
        <Alert
          type="success"
          className="mt-4"
          title={`Thank you for contacting ${vendor.name}!`}
        >
          Your message has been sent and we will respond to your request as soon
          as possible.
        </Alert>
      )}

      <FieldGroup>
        <FieldText name="customer_name" label="Full Name" />
        <FieldText name="customer_email" label="Email" />
        <FieldText name="subject" label="Subject" />
        <FieldTextarea name="message" label="Message" />
      </FieldGroup>

      <SubmitButton>Send Message</SubmitButton>
    </Form>
  )
}

import { type Address, type CountryCode } from "@utils/types"
import type { Address as MedusaAddress } from "@markethaus/storefront-client"
import { AddressElement, Elements } from "@stripe/react-stripe-js"
import { type AddressMode, loadStripe } from "@stripe/stripe-js"
import { useMemo, type Dispatch, type FC, type SetStateAction } from "react"
import { useEnv } from "@ui-components/hooks/useEnv"
import { useRegion } from "@ui-components/hooks/useRegion"
import { useCart } from "@ui-components/hooks/useCart"
import { useSiteDetails } from "@ui-components/hooks/useSiteDetails"
import { useRootLoaderData } from "@ui-components/hooks/useRootLoaderData"
import { FontWeight } from "@utils/medusa"
export interface StripeAddress {
  address: Address
  completed: boolean
}

export const defaultStripeAddress = (
  address?: MedusaAddress | null | undefined,
): StripeAddress => ({
  address: {
    firstName: address?.first_name || "",
    lastName: address?.last_name || "",
    address1: address?.address_1 || "",
    address2: address?.address_2 || "",
    province: address?.province || "",
    city: address?.city || "",
    countryCode: (address?.country_code as CountryCode) || "us",
    postalCode: address?.postal_code || "",
    phone: address?.phone || "",
  },
  completed: false,
})

interface MedusaStripeAddressProps {
  title?: string
  address: Address
  mode: AddressMode
  allowedCountries?: string[]
  setAddress: Dispatch<SetStateAction<StripeAddress>>
}

export const MedusaStripeAddress: FC<MedusaStripeAddressProps> = ({
  title,
  address,
  mode,
  allowedCountries = [],
  setAddress,
}) => {
  const { env } = useEnv()
  const { cart } = useCart()
  const { region } = useRegion()
  const { settings } = useSiteDetails()
  // const { googleFontsUrl } = useRootLoaderData();

  const stripePromise = useMemo(() => {
    return env.STRIPE_PUBLIC_KEY ? loadStripe(env.STRIPE_PUBLIC_KEY) : null
  }, [env.STRIPE_PUBLIC_KEY])

  if (!cart) return null

  return (
    <div>
      {title && <h3 className="mt-6 text-sm">{title}</h3>}
      <Elements
        stripe={stripePromise}
        options={{
          mode: "setup",
          currency: region.currency_code,
          // fonts: googleFontsUrl.map(link => ({ cssSrc: link })),
          appearance: {
            variables: {
              fontFamily: settings.body_font?.family,
              borderRadius: "6px",
              spacingUnit: "4.601px",
              fontSizeBase: "16px",
              colorText: "#374151",
              fontWeightNormal: "400",
              fontWeightBold: "700",
              fontSizeSm: "16px",
            },
            rules: {
              ".Input": {
                fontSize: "1rem",
                color: "#000000",
              },
              ".Input:focus": {
                boxShadow: "inset 0 0 0 1px rgba(210, 213, 218, 1)",
              },
              ".Label": {
                FontWeight: "700",
              },
            },
          },
        }}
      >
        <AddressElement
          options={{
            mode,
            allowedCountries,
            display: { name: "split" },
            fields: { phone: "always" },
            validation: { phone: { required: "always" } },
            defaultValues: {
              address: {
                line1: address.address1,
                line2: address.address2,
                city: address.city,
                state: address.province,
                postal_code: address.postalCode,
                country: address.countryCode.toUpperCase(),
              },
              phone: address.phone,
              firstName: address.firstName,
              lastName: address.lastName,
            },
          }}
          onChange={(e) => {
            setAddress({
              address: {
                firstName: e.value.firstName ?? "",
                lastName: e.value.lastName ?? "",
                address1: e.value.address.line1,
                address2: e.value.address.line2,
                province: e.value.address.state,
                city: e.value.address.city,
                countryCode:
                  e.value.address.country?.toLowerCase() as CountryCode,
                postalCode: e.value.address.postal_code,
                phone: e.value.phone,
              },
              completed: e.complete,
            })
          }}
        />
      </Elements>
    </div>
  )
}

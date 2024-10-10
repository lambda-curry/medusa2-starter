import { AddressValidationClient, protos } from "@googlemaps/addressvalidation"
import { Address } from "@libs/utils-to-merge/types/addresses"

export interface AddressSuggestionResponse {
  prompt: boolean
  address: Partial<Address>
}

const toGoogleAddress = (
  address: Partial<Address>,
): protos.google.type.IPostalAddress => {
  return {
    addressLines: [address.address1, address.address2].filter(
      (a) => !!a,
    ) as string[],
    postalCode: address.postalCode,
    locality: address.city,
    administrativeArea: address.province,
    regionCode: address.countryCode,
    organization: address.company,
    recipients: [`${address.firstName ?? ""} ${address.lastName ?? ""}`],
  }
}

const toAddress = (
  address: protos.google.type.IPostalAddress,
  originalAddress: Partial<Address>,
): Partial<Address> => {
  return {
    firstName: originalAddress.firstName,
    lastName: originalAddress.lastName,
    company: originalAddress.company,
    address1: address.addressLines?.[0] ?? originalAddress.address1,
    address2: address.addressLines?.[1] ?? originalAddress.address2,
    city: address.locality ?? originalAddress.city,
    phone: originalAddress.phone,
    province: address.administrativeArea ?? originalAddress.province,
    postalCode: address.postalCode ?? originalAddress.postalCode,
    countryCode:
      address.regionCode?.toLowerCase() ??
      originalAddress.countryCode?.toLowerCase(),
  }
}

export const getGoogleAddressValidationClient =
  (): AddressValidationClient | null => {
    const projectId = process.env.GOOGLE_ADDRESS_VALIDATION_PROJECT_ID
    if (!projectId) return null
    return new AddressValidationClient({ projectId })
  }

export const suggestAddress = async (
  address: Partial<Address>,
): Promise<AddressSuggestionResponse> => {
  const client = getGoogleAddressValidationClient()
  if (!client) return { prompt: false, address }

  const [result, request] = await client.validateAddress({
    address: toGoogleAddress(address),
  })

  const suggestedAddress = result?.result?.address?.postalAddress?.addressLines
    ?.length
    ? toAddress(result.result.address.postalAddress, address)
    : address

  if (result.result?.verdict?.addressComplete) {
    return {
      prompt:
        result.result?.address?.addressComponents?.some(
          (c) => c?.replaced || c?.spellCorrected,
        ) || false,
      address: suggestedAddress,
    }
  }

  return { prompt: false, address: suggestedAddress }
}

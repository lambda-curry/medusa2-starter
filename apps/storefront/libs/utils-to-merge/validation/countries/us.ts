import { Address } from "@libs/utils-to-merge/types/addresses"
import {
  AddressValidationResponse,
  listPostalCodes,
  listProvinces,
} from "../address-validation"

export const validateUsAddress = async (
  address: Address,
): Promise<AddressValidationResponse> => {
  const provinces = await listProvinces(address.countryCode)

  const province = provinces.provinces.find(
    (p) =>
      p.province_code.toLowerCase() === address.province.toLowerCase() ||
      p.province_name.toLowerCase() === address.province.toLowerCase(),
  )

  if (!province)
    return {
      address,
      errors: { province: "State is not valid" },
      invalid: true,
    }

  // automatically update province. ex: "new york" -> "NY"
  address.province = province.province_code

  const postalCodes = await listPostalCodes({
    province_code: province.province_code,
    country_code: province.country_code,
  })

  const postalCode = address.postalCode.split("-")[0]

  if (!postalCodes.postal_codes.includes(postalCode))
    return {
      address,
      errors: {
        postalCode: `Postal code is not valid for ${address.province}`,
      },
      invalid: true,
    }

  return { address, invalid: false }
}

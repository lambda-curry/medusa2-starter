import { Address } from "@libs/utils-to-merge/types/addresses"
import { AddressValidationResponse } from "../address-validation"
import { validateUsAddress } from "./us"

const validation: {
  [key: string]: (address: Address) => Promise<AddressValidationResponse>
} = {
  us: validateUsAddress,
}

export default validation
import { Button } from "@ui-components/common/buttons/Button"
import { Modal } from "@ui-components/common/modals/Modal"

import { type Address } from "@libs/utils-to-merge/types"
import { FetcherWithComponents } from "@remix-run/react"
import { FC } from "react"
import {
  CheckoutAction,
  UpdateAccountDetailsInput,
} from "~/routes/api.checkout"
import { convertToFormData } from "@libs/utils-to-merge/forms/objectToFormData"

export interface AddressSuggestions {
  original: Address
  suggested: Address
  suggestedPayload: UpdateAccountDetailsInput
  originalPayload: UpdateAccountDetailsInput
}

const AddressDetails: FC<{ address: Address; title: string }> = ({
  address,
  title,
}) => {
  return (
    <dl>
      <dt className="mt-6 text-sm font-bold text-gray-700">{title}</dt>
      <dd className="mt-0.5">
        {address?.company && (
          <>
            {address?.company}
            <br />
          </>
        )}
        {address?.address1}
        <br />
        {address?.address2 && (
          <>
            {address?.address2}
            <br />
          </>
        )}
        {address?.city}, {address?.province} {address?.postalCode}
        <br />
      </dd>
    </dl>
  )
}

export const AddressSuggestionModal: FC<{
  suggestions?: AddressSuggestions
  isOpen: boolean
  onClose: () => void
  fetcher: FetcherWithComponents<any>
}> = ({ suggestions, isOpen, onClose, fetcher }) => {
  if (!suggestions) return null

  const { original, suggested, suggestedPayload, originalPayload } = suggestions

  const takeSuggestions = async () => {
    fetcher.submit(
      convertToFormData({
        ...suggestedPayload,
        subaction: CheckoutAction.UPDATE_ACCOUNT_DETAILS,
        allowSuggestions: 0,
      }),
      { method: "post", action: "/api/checkout" },
    )
  }

  const useOriginal = async () => {
    fetcher.submit(
      convertToFormData({
        ...originalPayload,
        subaction: CheckoutAction.UPDATE_ACCOUNT_DETAILS,
        allowSuggestions: 0,
      }),
      { method: "post", action: "/api/checkout" },
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()}>
      <h2 className="text-lg font-bold text-gray-900">
        Double check your address
      </h2>

      <div className="flex flex-row gap-4 px-8">
        <div className="flex-1">
          <AddressDetails title="Original" address={original} />
        </div>
        <div className="flex-1">
          <AddressDetails title="Suggested" address={suggested} />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-4">
        <Button onClick={() => useOriginal()}>Use Original</Button>
        <Button variant="primary" onClick={() => takeSuggestions()}>
          Use Suggested
        </Button>
      </div>
    </Modal>
  )
}

import { FC, useState } from "react"
import { useFetcher } from "@remix-run/react"
import { Radio, Description, Label } from "@headlessui/react"
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon"
import TrashIcon from "@heroicons/react/24/outline/TrashIcon"
import clsx from "clsx"
import { CustomerAction } from "~/routes/_todo/api.customer"
import { Address } from "@components/Address/Address"
import { IconButton } from "@components/buttons/IconButton"
import { ConfirmModal } from "@components/modals/ConfirmModal"
import { Address as MedusaAddress } from "@libs/util/medusa"

export interface ShippingAddressRadioGroupOptionProps {
  shippingAddress: MedusaAddress
}

export const ShippingAddressRadioGroupOption: FC<
  ShippingAddressRadioGroupOptionProps
> = ({ shippingAddress }) => {
  const removeAddressFetcher = useFetcher<{ shippingAddressId: string }>()
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const isDeleting =
    removeAddressFetcher?.formData?.get("shippingAddressId") ===
    shippingAddress.id

  const handleDeleteClick = async (
    event: React.MouseEvent<any, MouseEvent>,
  ) => {
    event.preventDefault()
    setIsConfirming(true)
  }

  const handleConfirmDelete = () => {
    removeAddressFetcher.submit(
      {
        subaction: CustomerAction.DELETE_SHIPPING_ADDRESS,
        shippingAddressId: shippingAddress.id,
      },
      {
        method: "post",
        action: "/api/customer",
      },
    )
    setIsConfirming(false)
  }

  const handleCancelDelete = () => setIsConfirming(false)

  return (
    <>
      <Radio
        value={shippingAddress.id}
        disabled={isDeleting}
        className={({ checked }) =>
          clsx(
            "group",
            checked ? "border-transparent" : "border-gray-300",
            isDeleting ? "opacity-50" : "",
            "active:ring-primary-500 active:ring-2",
            "relative col-span-1 cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none",
          )
        }
      >
        {({ checked }) => (
          <>
            <div className="flex justify-between gap-1">
              <Label as="div" className="block text-sm font-bold text-gray-900">
                {shippingAddress.first_name} {shippingAddress.last_name}
              </Label>

              <div>
                {checked ? (
                  <CheckCircleIcon
                    className="text-primary-600 h-5 w-5"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            </div>

            <Description
              as="div"
              className="mt-6 flex items-end justify-between text-sm text-gray-500"
            >
              <Address address={shippingAddress} />

              <IconButton
                icon={TrashIcon}
                title="Edit shipping address"
                className="relative top-1 -mr-1.5 !h-8 !w-8"
                iconProps={{ className: "!w-5 !h-5" }}
                onClick={handleDeleteClick}
              />
            </Description>

            <div
              className={clsx(
                checked ? "border-primary-500" : "border-transparent",
                "pointer-events-none absolute -inset-px rounded-lg border-2 active:border",
              )}
              aria-hidden="true"
            />
          </>
        )}
      </Radio>

      <ConfirmModal
        isOpen={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Confirm delete shipping address"
        text={
          <div className="text-sm">
            <p>Are you sure you want to delete the following address?</p>
            <div className="mt-4 rounded-lg border p-4 shadow-sm">
              <Address address={shippingAddress} />
            </div>
            <p className="mt-4">This cannot be undone.</p>
          </div>
        }
      />
    </>
  )
}

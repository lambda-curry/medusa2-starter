import { FC, useState } from "react"
import { useFetcher } from "@remix-run/react"
import { Description, Label, Radio } from "@headlessui/react"
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon"
import TrashIcon from "@heroicons/react/24/outline/TrashIcon"
import clsx from "clsx"
import { CustomerAction } from "~/routes/_todo/api.customer"
import type { CreditCardBrand, PaymentMethod } from "@utils/types"
import { CreditCardIcon } from "@ui-components/common/icons/CreditCardIcon"
import { IconButton } from "@ui-components/common/buttons/IconButton"
import { ConfirmModal } from "@ui-components/common/modals/ConfirmModal"

export interface PaymentMethodsRadioGroupProps {
  paymentMethod: PaymentMethod
}

export const PaymentMethodsRadioGroupOption: FC<
  PaymentMethodsRadioGroupProps
> = ({ paymentMethod }) => {
  const removePaymentMethodFetcher = useFetcher<{}>()
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const isDeleting =
    removePaymentMethodFetcher.formData?.get("paymentMethodId") ===
    paymentMethod.data.id
  const { brand } = paymentMethod.data?.card || {}

  const handleDeleteClick = async (
    event: React.MouseEvent<any, MouseEvent>,
  ) => {
    event.preventDefault()
    setIsConfirming(true)
  }

  const handleConfirmDelete = () => {
    removePaymentMethodFetcher.submit(
      {
        subaction: CustomerAction.DELETE_PAYMENT_METHOD,
        paymentProviderId: paymentMethod.provider_id,
        paymentMethodId: paymentMethod.data?.id,
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
        value={paymentMethod.data.id}
        disabled={isDeleting}
        className={({ checked }) =>
          clsx(
            "group",
            checked ? "border-transparent" : "border-gray-300",
            "active:ring-primary-500 active:ring-2",
            isDeleting ? "opacity-50" : "",
            "relative col-span-1 cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none",
          )
        }
      >
        {({ checked }) => (
          <>
            <div className="flex justify-between gap-1">
              <Label
                as="div"
                className="flex items-center gap-x-2 text-sm font-bold text-gray-900"
              >
                <CreditCardIcon
                  className="-my-1"
                  brand={(brand || "unknown") as CreditCardBrand}
                />{" "}
                <span>
                  &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;
                  &bull;&bull;&bull;&bull; {paymentMethod.data.card?.last4}
                </span>
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
              <div>
                Expires {paymentMethod.data.card?.exp_month}/
                {paymentMethod.data.card?.exp_year}
              </div>

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
        title="Confirm delete payment method"
        text={
          <div className="text-sm">
            <p>Are you sure you want to delete the following payment method?</p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border p-4 text-sm shadow-sm">
              <div>
                <CreditCardIcon
                  className="-mb-2 mr-2"
                  brand={(brand || "unknown") as CreditCardBrand}
                />{" "}
                <span>
                  &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;
                  &bull;&bull;&bull;&bull; {paymentMethod.data.card?.last4}
                </span>
              </div>
              <div className="ml-2 text-gray-500">
                {paymentMethod.data.card?.exp_month}/
                {paymentMethod.data.card?.exp_year}
              </div>
            </div>
            <p className="mt-4">This cannot be undone.</p>
          </div>
        }
      />
    </>
  )
}

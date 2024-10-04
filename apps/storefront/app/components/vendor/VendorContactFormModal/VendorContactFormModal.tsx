import { FC } from "react"
import type { Vendor } from "@libs/util/medusa/types"
import { VendorContactForm } from "./VendorContactForm"
import { Modal, ModalProps } from "@ui-components/common/modals/Modal"

export interface VendorContactFormModalProps extends ModalProps {
  vendor: Vendor
}

export const VendorContactFormModal: FC<VendorContactFormModalProps> = ({
  vendor,
  ...props
}) => (
  <Modal {...props}>
    <h2 className="text-lg font-bold text-gray-900">Contact {vendor.name}</h2>
    <VendorContactForm vendor={vendor} />
  </Modal>
)

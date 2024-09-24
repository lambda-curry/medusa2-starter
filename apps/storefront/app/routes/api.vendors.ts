import { V2ActionHandler, handleActionV2 } from '@marketplace/util/handleAction.server';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { withYup } from '@remix-validated-form/with-yup';
import { validationError } from 'remix-validated-form';
import * as Yup from 'yup';

export enum VendorAction {
  CONTACT = 'contact'
}

export interface VendorContactFormInput {
  vendor_id: string;
  customer_email: string;
  customer_name: string;
  subject: string;
  message: string;
}

export const vendorContactFormValidator = withYup(
  Yup.object().shape({
    vendor_id: Yup.string().required('Vendor ID is required'),
    customer_email: Yup.string().email().required('Email is required'),
    customer_name: Yup.string().required('Full name is required'),
    subject: Yup.string().required('Subject is required'),
    message: Yup.string().required('Message is required')
  })
);

const contact: V2ActionHandler = async (data: VendorContactFormInput, { request }) => {
  const client = await createMedusaClient({ request });

  const result = await vendorContactFormValidator.validate(data);

  if (result.error) return validationError(result.error);

  try {
    const { vendor_id, customer_email, customer_name, subject, message } = result.data;

    await client.vendors.contact(vendor_id, {
      customer_email,
      customer_name,
      subject,
      message
    });

    return json({ success: true }, { status: 200 });
  } catch (ex: any) {
    return json(ex.response.data, { status: ex.response.status });
  }
};

const actions = {
  contact
};

export const action = async (actionArgs: ActionFunctionArgs) => {
  const data = await handleActionV2({
    actionArgs,
    actions
  });

  return data;
};

import { CreateNewsletterSubscriberReq } from '@marketplace/util/medusa';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { createMedusaClient, Medusa } from '@marketplace/util/medusa/client.server';
import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';
import { validationError } from 'remix-validated-form';
import { emailAddressValidation } from '@marketplace/util/validation';
import { handleActionV2, V2ActionHandler } from '@marketplace/util/handleAction.server';

export enum NewsletterSubscriptionAction {
  SUBSCRIBE_EMAIL = 'subscribeEmail'
}

export const newsletterSubscriberFormValidator = withYup(
  Yup.object().shape({
    ...emailAddressValidation
  })
);

const subscribeEmail: V2ActionHandler = async (data: CreateNewsletterSubscriberReq, { request }) => {
  const client = await createMedusaClient({ request });

  const result = await newsletterSubscriberFormValidator.validate(data);
  if (result.error) return validationError(result.error);

  try {
    const { email } = result.data;
    await client.newsletterSubscriptions.subscribeEmail({ email });
    return json({ success: true }, { status: 200 });
  } catch (error: any) {
    return json(error.response.data, { status: error.response.status });
  }
};

const actions = {
  subscribeEmail
};

export const action = async (actionArgs: ActionFunctionArgs) => {
  return await handleActionV2({
    actionArgs,
    actions
  });
};

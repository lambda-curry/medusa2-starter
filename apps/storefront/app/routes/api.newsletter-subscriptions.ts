import { CreateNewsletterSubscriberReq } from '@libs/types';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';
import { validationError } from 'remix-validated-form';
import { emailAddressValidation } from '@libs/util/validation';
import { handleAction, ActionHandler } from '@libs/util/handleAction.server';

export enum NewsletterSubscriptionAction {
  SUBSCRIBE_EMAIL = 'subscribeEmail',
}

export const newsletterSubscriberFormValidator = withYup(
  Yup.object().shape({
    ...emailAddressValidation,
  }),
);

const subscribeEmail: ActionHandler = async (data: CreateNewsletterSubscriberReq, { request }) => {
  const result = await newsletterSubscriberFormValidator.validate(data);
  if (result.error) return validationError(result.error);

  try {
    const { email } = result.data;

    // Implement newsletter subscription here!

    console.log('Subscribed to newsletter', email);

    return json({ success: true }, { status: 200 });
  } catch (error: any) {
    return json(error.response.data, { status: error.response.status });
  }
};

const actions = {
  subscribeEmail,
};

export const action = async (actionArgs: ActionFunctionArgs) => {
  return await handleAction({
    actionArgs,
    actions,
  });
};

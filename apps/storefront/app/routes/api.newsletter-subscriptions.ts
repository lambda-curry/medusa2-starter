import { CreateNewsletterSubscriberReq } from "@libs/util/medusa"
import { ActionFunctionArgs, json } from "@remix-run/node"
import { withYup } from "@remix-validated-form/with-yup"
import * as Yup from "yup"
import { validationError } from "remix-validated-form"
import { emailAddressValidation } from "@libs/util/validation"
import { handleActionV2, V2ActionHandler } from "@libs/util/handleAction.server"

export enum NewsletterSubscriptionAction {
  SUBSCRIBE_EMAIL = "subscribeEmail",
}

export const newsletterSubscriberFormValidator = withYup(
  Yup.object().shape({
    ...emailAddressValidation,
  }),
)

const subscribeEmail: V2ActionHandler = async (
  data: CreateNewsletterSubscriberReq,
  { request },
) => {
  const result = await newsletterSubscriberFormValidator.validate(data)
  if (result.error) return validationError(result.error)

  try {
    const { email } = result.data

    // TODO: subscribe to newsletter

    return json({ success: true }, { status: 200 })
  } catch (error: any) {
    return json(error.response.data, { status: error.response.status })
  }
}

const actions = {
  subscribeEmail,
}

export const action = async (actionArgs: ActionFunctionArgs) => {
  return await handleActionV2({
    actionArgs,
    actions,
  })
}
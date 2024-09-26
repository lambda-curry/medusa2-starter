import {
  unstable_parseMultipartFormData,
  type ActionFunctionArgs,
} from "@remix-run/node"
import { uploadHandler } from "~/image-upload.server"
import { FormValidationError } from "@utils/validation/validation-error"
import { handleValidationError } from "@utils/validation/validation-response"
import { formDataToObject } from "@utils/forms/formDataToObject"
import { Medusa } from "./server/client.server"
import { DataWithResponseInit } from "@remix-run/router/utils"
import { json } from "@remix-run/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionHandler<T = unknown> = (
  payload: any,
  client: Medusa,
  request: ActionFunctionArgs["request"],
) => Promise<T>

export type V2ActionHandler<T = unknown> = (
  payload: any,
  data: ActionFunctionArgs,
) => Promise<T | DataWithResponseInit<T>>

export type V2ActionHandlers<T = unknown> = Record<string, V2ActionHandler<T>>

export type ActionHandlers<T = unknown> = Record<string, ActionHandler<T>>

export interface HandleActionProps<T = unknown> {
  request: ActionFunctionArgs["request"]
  actions: ActionHandlers<T>
}

// export async function handleAction<T>({ request, actions }: HandleActionProps<T>) {
//   const medusa = await createMedusaClient({ request });

//   const isMultiPart = request.headers.get('content-type')?.toLowerCase().includes('multipart/form-data');

//   const formData = isMultiPart
//     ? await unstable_parseMultipartFormData(request, uploadHandler)
//     : await request.formData();

//   const { subaction, ...data } = formDataToObject<keyof ActionHandlers<T>>(formData);

//   const actionHandlers = actions;

//   const action = actionHandlers[subaction as keyof ActionHandlers<T>];

//   if (!action) throw new Error(`Action handler not found for "${subaction}" action.`);

//   return await action(data, medusa, request);
// }

export async function handleActionV2<T>({
  actionArgs,
  actions,
}: {
  actionArgs: ActionFunctionArgs
  actions: V2ActionHandlers<T>
}) {
  const { request } = actionArgs

  const contentType = request.headers.get("content-type")?.toLowerCase()

  const shouldReturnJson = request.headers.get("accept") === "application/json"

  let rawData: any = undefined

  if (contentType?.includes("application/json")) rawData = await request.json()
  else if (contentType?.includes("multipart/form-data"))
    rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  else if (contentType?.includes("x-www-form-urlencoded"))
    rawData = await request.formData()

  const { subaction, ...data } = formDataToObject<keyof V2ActionHandlers<T>>(
    rawData ?? {},
  )

  const actionHandlers = actions

  const action = actionHandlers[subaction as keyof V2ActionHandlers<T>]

  if (!action)
    throw new Error(`Action handler not found for "${subaction}" action.`)

  try {
    const result = await action(data, actionArgs)

    if (
      typeof result === "object" &&
      (result as DataWithResponseInit<T>).type === "DataWithResponseInit" &&
      shouldReturnJson
    ) {
      let typedResult = result as DataWithResponseInit<T>
      return json(typedResult.data, typedResult.init ?? undefined)
    }

    if (result instanceof Response) return result

    if (shouldReturnJson) return json(result)

    return result
  } catch (error) {
    if (error instanceof FormValidationError)
      return handleValidationError({
        shouldReturnJson,
        error: error.error,
        repopulateFields: error.repopulateFields,
      })
    if (error instanceof Response) throw error
    console.error("Error in action handler:", error)
    throw error
  }
}

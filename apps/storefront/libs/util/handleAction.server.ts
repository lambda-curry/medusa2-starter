import { unstable_parseMultipartFormData, type ActionFunctionArgs } from '@remix-run/node';
import { uploadHandler } from '@app/image-upload.server';
import { FormValidationError } from '@libs/util/validation/validation-error';
import { handleValidationError } from '@libs/util/validation/validation-response';
import { formDataToObject } from '@libs/util/forms/formDataToObject';
import { DataWithResponseInit } from '@remix-run/router/utils';
import { json } from '@remix-run/react';

export type ActionHandler<T = unknown> = (
  payload: any,
  data: ActionFunctionArgs,
) => Promise<T | DataWithResponseInit<T>>;

export type ActionHandlers<T = unknown> = Record<string, ActionHandler<T>>;

export async function handleAction<T>({
  actionArgs,
  actions,
}: {
  actionArgs: ActionFunctionArgs;
  actions: ActionHandlers<T>;
}) {
  const { request } = actionArgs;

  const contentType = request.headers.get('content-type')?.toLowerCase();

  const shouldReturnJson = request.headers.get('accept') === 'application/json';

  let rawData: any = undefined;

  if (contentType?.includes('application/json')) rawData = await request.json();
  else if (contentType?.includes('multipart/form-data'))
    rawData = await unstable_parseMultipartFormData(request, uploadHandler);
  else if (contentType?.includes('x-www-form-urlencoded')) rawData = await request.formData();

  const { subaction, ...data } = formDataToObject<keyof ActionHandlers<T>>(rawData ?? {});

  const actionHandlers = actions;

  const action = actionHandlers[subaction as keyof ActionHandlers<T>];

  if (!action) throw new Error(`Action handler not found for "${subaction}" action.`);

  try {
    const result = await action(data, actionArgs);

    if (
      typeof result === 'object' &&
      (result as DataWithResponseInit<T>).type === 'DataWithResponseInit' &&
      shouldReturnJson
    ) {
      let typedResult = result as DataWithResponseInit<T>;
      return json(typedResult.data, typedResult.init ?? undefined);
    }

    if (result instanceof Response) return result;

    if (shouldReturnJson) return json(result);

    return result;
  } catch (error) {
    if (error instanceof FormValidationError)
      return handleValidationError({
        shouldReturnJson,
        error: error.error,
        repopulateFields: error.repopulateFields,
      });
    if (error instanceof Response) throw error;
    console.error('Error in action handler:', error);
    throw error;
  }
}

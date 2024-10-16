import { data as remixData } from '@remix-run/node';
import { json } from '@remix-run/react';
import { ValidatorError } from 'remix-validated-form';

export interface ValidationErrorData {
  fieldErrors: Record<string, string>;
  repopulateFields?: unknown;
  formId?: string;
}

export const handleValidationError = ({
  shouldReturnJson,
  error,
  repopulateFields,
}: {
  shouldReturnJson?: boolean;
  error: ValidatorError;
  repopulateFields?: unknown;
}) => {
  const payload = {
    fieldErrors: error.fieldErrors,
    repopulateFields,
    formId: error.formId,
  };

  if (shouldReturnJson) return json(payload, { status: 422 });

  return remixData(payload, { status: 422 });
};

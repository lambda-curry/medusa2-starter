import { ValidatorError } from 'remix-validated-form';

export class FormValidationError extends Error {
  constructor(
    public readonly error: ValidatorError,
    public readonly repopulateFields?: unknown,
  ) {
    super();
  }
}

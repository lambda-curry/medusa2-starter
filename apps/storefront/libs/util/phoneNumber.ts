export type FormatPhoneNumberMask = 'default' | 'dots' | 'dashes' | 'uri';

export type FormatPhoneNumberCountryCode = 'US';

export interface FormatPhoneNumberOptions {
  format: FormatPhoneNumberMask;
  countryCode: FormatPhoneNumberCountryCode;
  customMask?: string;
}

/**
 * Assists with applying different formats dynamically to a given phone number.
 * We provide default masks which can be used via the `format` and `countryCode`
 * options, or a consumer may pass in a `customMask`.
 *
 * @param phoneNumber string
 * @param options object
 * @return string
 */
export const formatPhoneNumber = (phoneNumber: string, options?: Partial<FormatPhoneNumberOptions>) => {
  return phoneNumber;
};

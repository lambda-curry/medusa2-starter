import IMask from 'imask';
import merge from 'lodash/merge';

export type FormatPhoneNumberMask = 'default' | 'dots' | 'dashes' | 'uri';

export type FormatPhoneNumberCountryCode = 'US';

export interface FormatPhoneNumberOptions {
  format: FormatPhoneNumberMask;
  countryCode: FormatPhoneNumberCountryCode;
  customMask?: string;
}

const phoneNumberMasks = {
  US: {
    default: '(000) 000-0000',
    dots: '000.000.0000',
    dashes: '000-000-0000',
    uri: 'tel:+10000000000'
  }
};

const defaultOptions: FormatPhoneNumberOptions = {
  format: 'default',
  countryCode: 'US'
};

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

  // TODO: since we're working with international phone numbers, we'll need to revisit this function, but for now it seems fine to just display the phone number as it is input into the field
  // const mergedOptions = merge({}, defaultOptions, options);
  // const mask = mergedOptions.customMask || phoneNumberMasks[mergedOptions.countryCode][mergedOptions.format];
  // const phoneNumberMask = IMask.createPipe({ mask });

  // return phoneNumberMask(phoneNumber);
};

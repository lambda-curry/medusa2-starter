import validateFn from './countries';
import { provincePostalCodeCache } from '../../../markethaus-storefront/app/cache/provincePostalCodeCache';
import { ONE_WEEK, useCache } from '../use-cache';
import { Address } from '@utils/types/addresses';

const addressValidationEnabled = !!process.env.ADDRESS_VALIDATION_API_URL;
const baseURL = process.env.ADDRESS_VALIDATION_API_URL;

export type AddressValidationResponse = {
  address: Address;
  errors?: { [key: string]: string };
  invalid?: boolean;
};

export interface Province {
  province_name: string;
  province_code: string;
  country_code: string;
}

export const listProvinces = async (
  country_code: string
): Promise<{ provinces: Province[] }> => {
  return await useCache(
    provincePostalCodeCache,
    `list-provinces-${country_code}`,
    async () => {
      const response = await fetch(`${baseURL}/provinces/${country_code}`);
      const result: { provinces: Province[] } = await response.json();
      return result;
    },
    { ttl: ONE_WEEK }
  );
};

export const listPostalCodes = async ({
  province_code,
  country_code,
}: {
  province_code: string;
  country_code: string;
}): Promise<{ postal_codes: string[] }> => {
  return await useCache(
    provincePostalCodeCache,
    `list-postal-codes-${country_code}-${province_code}`,
    async () => {
      const response = await fetch(
        `${baseURL}/postal-codes/${country_code}/${province_code}`
      );
      const result: { postal_codes: string[] } = await response.json();
      return result;
    },
    { ttl: ONE_WEEK }
  );
};

export const validateAddress = async (
  address: Address
): Promise<AddressValidationResponse> => {
  const validate = validateFn[address.countryCode];

  if (!validate || !addressValidationEnabled)
    return { address, invalid: undefined };

  return await validate(address);
};

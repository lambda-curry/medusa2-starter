import type { Address, MedusaAddress } from '@libs/types';
import { StoreCreateCustomerAddress } from '@medusajs/types';

export const emptyAddress: Address = {
  firstName: '',
  lastName: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  province: '',
  postalCode: '',
  countryCode: '',
  phone: '',
};

export const medusaAddressToAddress = (address?: MedusaAddress | null): Address => {
  if (!address) return emptyAddress;

  return {
    ...emptyAddress,
    firstName: address?.first_name || '',
    lastName: address?.last_name || '',
    company: address?.company || '',
    address1: address?.address_1 || '',
    address2: address?.address_2 || '',
    city: address?.city || '',
    countryCode: address?.country_code || '',
    phone: address?.phone || '',
    postalCode: address?.postal_code || '',
    province: address?.province || '',
  };
};

export const addressPayload = (address?: MedusaAddress | null): StoreCreateCustomerAddress => {
  if (!address) return emptyAddress as StoreCreateCustomerAddress;

  return {
    first_name: address?.first_name || '',
    last_name: address?.last_name || '',
    company: address?.company || '',
    address_1: address?.address_1 || '',
    address_2: address?.address_2 || '',
    city: address?.city || '',
    country_code: address?.country_code || '',
    phone: address?.phone || '',
    postal_code: address?.postal_code || '',
    province: address?.province || '',
  };
};

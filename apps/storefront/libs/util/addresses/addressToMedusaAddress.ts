import { Address, MedusaAddress } from '@libs/types';

export const addressToMedusaAddress = (address: Address): MedusaAddress => {
  if (!address) return {} as MedusaAddress;

  return {
    first_name: address.firstName,
    last_name: address.lastName,
    company: address.company || '',
    address_1: address.address1,
    address_2: address.address2 || '',
    city: address.city,
    country_code: address.countryCode,
    phone: address.phone || '',
    postal_code: address.postalCode,
    province: address.province,
  } as MedusaAddress;
};

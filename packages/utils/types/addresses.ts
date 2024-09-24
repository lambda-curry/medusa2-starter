import { Address as FullMedusaAddress, Country } from '@medusajs/medusa';

export type CountryCode = Country['iso_2'];
export interface Address {
  firstName: string;
  lastName: string;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  province: string;
  countryCode: string;
  postalCode: string;
  phone?: string | null;
  country?: Country | null;
}

export interface MedusaAddress
  extends Omit<
    FullMedusaAddress,
    | 'id'
    | 'beforeInsert'
    | 'customer'
    | 'customer_id'
    | 'created_at'
    | 'updated_at'
    | 'deleted_at'
    | 'country'
    | 'metadata'
  > {}

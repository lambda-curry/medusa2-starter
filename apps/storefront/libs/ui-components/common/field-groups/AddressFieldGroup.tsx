import { FieldGroup } from '../forms/fields/FieldGroup';
import { FieldSelect } from '../forms/fields/FieldSelect';
import { FieldText } from '../forms/fields/FieldText';
import { ChangeEvent, FC } from 'react';

export interface AddressFieldGroupProps {
  prefix?: 'shipping_address' | 'billing_address';
  countryOptions: { value: string; label: string }[];
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const AddressFieldGroup: FC<AddressFieldGroupProps> = ({ prefix, countryOptions, onChange }) => {
  const fieldPrefix = prefix ? `${prefix}.` : '';

  return (
    <FieldGroup>
      <FieldText
        name={`${fieldPrefix}first_name`}
        placeholder="First Name"
        autoComplete="given_name"
        className="sm:col-span-6"
        onChange={onChange}
      />
      <FieldText
        name={`${fieldPrefix}last_name`}
        placeholder="Last Name"
        autoComplete="family-name"
        className="sm:col-span-6"
        onChange={onChange}
      />
      {prefix === 'billing_address' && (
        <FieldText
          name={`${fieldPrefix}company`}
          placeholder="Company"
          autoComplete="organization"
          onChange={onChange}
        />
      )}
      <FieldText
        name={`${fieldPrefix}address_1`}
        placeholder="Address"
        autoComplete="address-line1"
        onChange={onChange}
      />
      <FieldText
        name={`${fieldPrefix}address_2`}
        placeholder="Apartment, suite, etc."
        autoComplete="address-line2"
        onChange={onChange}
      />
      <FieldSelect
        name={`${fieldPrefix}country_code`}
        placeholder="Country"
        options={countryOptions}
        autoComplete="country-code"
        className="sm:col-span-6"
        onChange={onChange}
      />
      <FieldText
        name={`${fieldPrefix}city`}
        placeholder="City"
        autoComplete="home city"
        className="sm:col-span-6"
        onChange={onChange}
      />
      <FieldText
        name={`${fieldPrefix}province`}
        placeholder="State/Province"
        autoComplete="address-level1"
        className="sm:col-span-6"
        onChange={onChange}
      />
      <FieldText
        name={`${fieldPrefix}postal_code`}
        placeholder="Postal code"
        autoComplete="postal-code"
        className="sm:col-span-6"
        onChange={onChange}
      />
      <FieldText name={`${fieldPrefix}phone`} placeholder="Phone" type="tel" autoComplete="tel" onChange={onChange} />
    </FieldGroup>
  );
};

import { FieldGroup } from '../forms/fields/FieldGroup';
import { FieldSelect } from '../forms/fields/FieldSelect';
import { FieldText } from '../forms/fields/FieldText';
import { ChangeEvent, FC } from 'react';

export interface AddressFieldGroupProps {
  prefix?: string;
  countryOptions: { value: string; label: string }[];
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const AddressFieldGroup: FC<AddressFieldGroupProps> = ({ prefix, countryOptions, onChange }) => {
  const fieldPrefix = prefix ? `${prefix}.` : '';

  return (
    <FieldGroup>
      <FieldText
        name={`${fieldPrefix}firstName`}
        placeholder="First Name"
        autoComplete="given_name"
        className="sm:col-span-6"
        onChange={onChange}
      />
      <FieldText
        name={`${fieldPrefix}lastName`}
        placeholder="Last Name"
        autoComplete="family-name"
        className="sm:col-span-6"
        onChange={onChange}
      />
      {/* <FieldText name={`${fieldPrefix}company`} placeholder="Company" autoComplete="organization" onChange={onChange} /> */}
      <FieldText
        name={`${fieldPrefix}address1`}
        placeholder="Address"
        autoComplete="address-line1"
        onChange={onChange}
      />
      <FieldText
        name={`${fieldPrefix}address2`}
        placeholder="Apartment, suite, etc."
        autoComplete="address-line2"
        onChange={onChange}
      />
      <FieldSelect
        name={`${fieldPrefix}countryCode`}
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
        name={`${fieldPrefix}postalCode`}
        placeholder="Postal code"
        autoComplete="postal-code"
        className="sm:col-span-6"
        onChange={onChange}
      />
      <FieldText name={`${fieldPrefix}phone`} placeholder="Phone" type="tel" autoComplete="tel" onChange={onChange} />
    </FieldGroup>
  );
};

import { FC } from 'react';
import { FieldGroup, FieldGroupProps } from '../forms/fields/FieldGroup';
import { FieldPassword } from '../forms/fields/FieldPassword';

export interface ConfirmPasswordFieldGroup extends FieldGroupProps {}

export const ConfirmPasswordFieldGroup: FC<ConfirmPasswordFieldGroup> = (props) => (
  <FieldGroup {...props}>
    <FieldPassword name="password" label="Password" autoComplete="new-password" />
    <FieldPassword name="confirmPassword" label="Confirm Password" />
  </FieldGroup>
);

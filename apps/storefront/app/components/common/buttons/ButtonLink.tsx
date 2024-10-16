import { FC } from 'react';
import { Button, ButtonProps } from './Button';

export interface ButtonLinkProps extends ButtonProps {}

export const ButtonLink: FC<ButtonLinkProps> = (props) => <Button variant="link" {...props} />;

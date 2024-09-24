import {
  StorefrontProvider,
  storefrontInitialState,
} from '@ui-components/providers';
import { FC, PropsWithChildren } from 'react';

export const RootProviders: FC<PropsWithChildren> = ({ children }) => (
  <StorefrontProvider data={storefrontInitialState}>
    {children}
  </StorefrontProvider>
);

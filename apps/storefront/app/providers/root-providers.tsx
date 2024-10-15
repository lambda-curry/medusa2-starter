import { FC, PropsWithChildren } from 'react';
import { storefrontInitialState, StorefrontProvider } from '@app/providers/storefront-provider';

export const RootProviders: FC<PropsWithChildren> = ({ children }) => (
  <StorefrontProvider data={storefrontInitialState}>{children}</StorefrontProvider>
);

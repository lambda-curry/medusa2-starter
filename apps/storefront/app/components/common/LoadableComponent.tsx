import React, { FC } from 'react';
import loadable from '@loadable/component';

type LoaderFunction = () => Promise<{ default: React.ComponentType<any> }>;

interface LoadableComponentProps {
  load: LoaderFunction;
}

export const LoadableComponent: FC<LoadableComponentProps> = ({ load, ...props }) => {
  const LoadedComponent = loadable(load, { ssr: true });

  return <LoadedComponent {...props} />;
};

import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const NoHydrationPortal: FC<PropsWithChildren<{ portalLocation?: HTMLDivElement }>> = ({
  children,
  portalLocation
}) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = document.createElement('div');
    const location = portalLocation || document.body;
    location?.appendChild(div);
    setContainer(div);

    return () => {
      if (div) {
        location.removeChild(div);
      }
    };
  }, []);

  return container ? createPortal(children, container) : null;
};

export default NoHydrationPortal;

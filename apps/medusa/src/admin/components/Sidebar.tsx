import { XMark } from '@medusajs/icons';
import { Drawer, Heading, IconButton, clx } from '@medusajs/ui';
import { PropsWithChildren } from 'react';
import { useMediaQuery } from '../hooks/use-media-query';

const DrawerSidebarContainer = ({
  title,
  children,
  side = 'left',
  isOpen,
  toggle,
}: { title?: string; children: React.ReactNode; side?: 'left' | 'right'; isOpen: boolean; toggle: () => void }) => {
  return (
    <Drawer open={isOpen} onOpenChange={toggle}>
      <Drawer.Content
        className={clx({
          'left-2': side === 'left',
          'right-2': side === 'right',
        })}
      >
        <div className="p-3 flex justify-between">
          <Drawer.Title>{title}</Drawer.Title>
          <IconButton size="small" variant="transparent" className="text-ui-fg-subtle" onClick={toggle}>
            <XMark />
          </IconButton>
        </div>
        <div className="p-3">{children}</div>
      </Drawer.Content>
    </Drawer>
  );
};

const StaticSidebarContainer = ({
  header,
  toggle,
  children,
  side = 'left',
  className,
  isOpen,
}: PropsWithChildren & {
  header?: {
    title: string;
    showCloseButton?: boolean;
  };
  side?: 'left' | 'right';
  isOpen: boolean;
  className?: string;
  toggle: () => void;
  showCloseButton?: boolean;
}) => {
  return (
    <div
      className={clx('h-screen flex-col min-w-[300px] bg-white', className, {
        'lg:flex': isOpen,
        hidden: !isOpen,
        'border-r': side === 'left',
        'border-l': side === 'right',
      })}
    >
      {header && (
        <div className="p-3 flex justify-between w-full">
          <div className="w-full flex flex-row justify-between items-center mb-2">
            <Heading level="h2">{header?.title}</Heading>
            {header?.showCloseButton && (
              <IconButton variant="transparent" size="small" onClick={() => toggle()}>
                <XMark />
              </IconButton>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export const SidebarContainer = {
  Drawer: DrawerSidebarContainer,
  Static: StaticSidebarContainer,
};

export interface SidebarProps extends PropsWithChildren {
  side: 'left' | 'right';
  className?: string;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  showCloseButton?: boolean;
  header?: {
    title: string;
    showCloseButton?: boolean;
  };
}

export const Sidebar = ({ children, side, className, isOpen, toggle, header }: SidebarProps) => {
  const isLargeScreen = useMediaQuery('(min-width: 768px)');

  return (
    <>
      <StaticSidebarContainer
        side={side}
        isOpen={isLargeScreen && isOpen}
        className={className}
        header={header}
        toggle={toggle}
      >
        {children}
      </StaticSidebarContainer>

      <DrawerSidebarContainer side={side} isOpen={!isLargeScreen && isOpen} title={header?.title} toggle={toggle}>
        {children}
      </DrawerSidebarContainer>
    </>
  );
};

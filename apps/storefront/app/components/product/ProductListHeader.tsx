import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import { CustomAction } from '@libs/types';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { SectionHeading } from '@app/components/sections/SectionHeading';
import { URLAwareNavLink } from '@app/components/common/link';

export interface ProductListHeaderProps extends PropsWithChildren {
  className?: string;
  heading?: ReactNode;
  text?: string;
  actions?: CustomAction[];
  customActions?: ReactNode;
}

export const ProductListHeader: FC<ProductListHeaderProps> = ({ heading, children, text, actions, customActions }) => {
  if (!(heading || children) && !text && !actions?.length && !customActions) return null;

  return (
    <header className="mb-4 flex flex-col items-start gap-2 md:mb-6 md:flex-row md:gap-4 lg:mb-8">
      <div className="w-full flex-1 md:w-auto">
        <div className="inline-grid !max-w-prose gap-6">
          {(heading || children) && <SectionHeading className="font-italiana">{heading || children}</SectionHeading>}
          {text && <div>{text}</div>}
        </div>
      </div>

      {!!actions?.length && (
        <div className="flex grow-0 items-center gap-2">
          {actions.map(({ label, url }, index) => {
            if (!label) return null;

            return (
              <URLAwareNavLink key={index} url={url} prefetch="render" className="flex items-center hover:underline">
                {label}
                <ArrowRightIcon className="ml-1.5 h-4" />
              </URLAwareNavLink>
            );
          })}
        </div>
      )}

      {customActions && <div className="mt-2 flex grow-0 items-center gap-2 sm:mt-0">{customActions}</div>}
    </header>
  );
};

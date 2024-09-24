import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';
import { URLAwareNavLink } from '@components/link/URLAwareNavLink';
import { Button } from '@components/buttons';
import { type CustomAction } from '@marketplace/util/medusa/types';

export interface ActionListProps extends HTMLAttributes<HTMLDivElement> {
  actions: CustomAction[];
}

export const ActionList: FC<ActionListProps> = ({
  actions,
  className,
  ...props
}) => (
  <div
    className={clsx('flex flex-wrap items-center gap-4 lg:gap-6', className)}
  >
    {actions.map(({ url, label, new_tab, style_variant }, index) => {
      if (!label.value) return null;

      return (
        <Button
          variant={style_variant}
          key={index}
          as={buttonProps => (
            <URLAwareNavLink
              url={url.value || '#'}
              newTab={new_tab}
              {...buttonProps}
            >
              {label.value}
            </URLAwareNavLink>
          )}
        />
      );
    })}
  </div>
);

import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';
import { URLAwareNavLink } from '@ui-components/common/link/URLAwareNavLink';
import { Button } from '@ui-components/common/buttons';
import { type CustomAction } from '@libs/types';

export interface ActionListProps extends HTMLAttributes<HTMLDivElement> {
  actions: CustomAction[];
}

export const ActionList: FC<ActionListProps> = ({ actions, className }) => (
  <div className={clsx('flex flex-wrap items-center gap-4 lg:gap-6', className)}>
    {actions.map(({ url, label, new_tab, style_variant }, index) => {
      if (!label) return null;

      return (
        <Button
          variant={style_variant}
          key={index}
          as={(buttonProps) => (
            <URLAwareNavLink url={url} newTab={new_tab} {...buttonProps}>
              {label}
            </URLAwareNavLink>
          )}
        />
      );
    })}
  </div>
);

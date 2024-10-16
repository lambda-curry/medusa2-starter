import { Link } from '@remix-run/react';
import clsx from 'clsx';
import { FC, Fragment, ReactNode } from 'react';
import { ButtonLink } from '../buttons/ButtonLink';

export interface Breadcrumb {
  label: ReactNode;
  url?: string;
}

export interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  className?: string;
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ breadcrumbs, className }) => (
  <nav aria-label="Breadcrumb" className={clsx('breadcrumbs', className)}>
    <ol className="flex flex-wrap items-center gap-2.5 text-sm leading-none text-gray-300 md:mt-0">
      {breadcrumbs.map((breadcrumb, breadcrumbIdx) => (
        <Fragment key={breadcrumbIdx}>
          <li>
            {breadcrumb.url ? (
              <ButtonLink
                size="sm"
                as={(buttonProps) => (
                  <Link viewTransition prefetch="intent" {...buttonProps} to={breadcrumb.url || ''} />
                )}
                className="!text-gray-500 no-underline hover:!text-gray-700 hover:underline"
              >
                {breadcrumb.label}
              </ButtonLink>
            ) : (
              <span className="font-bold text-gray-500">{breadcrumb.label}</span>
            )}
          </li>
          {breadcrumbIdx !== breadcrumbs.length - 1 && <li>/</li>}
        </Fragment>
      ))}
    </ol>
  </nav>
);

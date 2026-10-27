import { FC, HTMLAttributes, PropsWithChildren } from 'react';
import { NavLink, NavLinkProps } from 'react-router';

export interface AwareNavLinkProps {
  url: string;
  newTab?: boolean;
  prefetch?: NavLinkProps['prefetch'];
  preventScrollReset?: NavLinkProps['preventScrollReset'];
  className?: string | ((props: { isActive: boolean }) => string | undefined);
}

export const URLAwareNavLink: FC<
  PropsWithChildren<AwareNavLinkProps & Omit<HTMLAttributes<HTMLAnchorElement>, 'className'>>
> = ({ url, newTab, prefetch = 'intent', preventScrollReset, className, children, ...rest }) => {
  const isExternal = url.startsWith('http') || url.startsWith('mailto') || url.startsWith('tel');
  const target = newTab ? '_blank' : '_self';
  const rel = newTab ? 'noopener noreferrer' : undefined;

  if (isExternal)
    return (
      <a
        href={url}
        className={typeof className === 'function' ? className({ isActive: false }) : className}
        target={target}
        rel={rel}
        {...rest}
      >
        {children}
      </a>
    );

  return (
    <NavLink
      viewTransition
      className={className}
      to={url}
      prefetch={prefetch}
      preventScrollReset={preventScrollReset}
      target={target}
      rel={rel}
      {...rest}
    >
      {children}
    </NavLink>
  );
};

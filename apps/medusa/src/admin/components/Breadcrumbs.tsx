import { clx } from '@medusajs/ui';
import { Link } from 'react-router-dom';
import { TriangleRightMini } from '@medusajs/icons';

export const Breadcrumbs = ({ crumbs }: { crumbs: { label: string; path: string }[] }) => {
  return (
    <ol className={clx('text-ui-fg-muted txt-compact-small-plus flex select-none items-center')}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const isSingle = crumbs.length === 1;

        return (
          <li key={index} className={clx('flex items-center')}>
            {!isLast && crumb.path ? (
              <Link className="transition-fg hover:text-ui-fg-subtle" to={crumb.path}>
                {crumb.label}
              </Link>
            ) : (
              <div>
                {!isSingle && isLast && <span className="block lg:hidden">...</span>}
                <span
                  key={index}
                  className={clx({
                    'hidden lg:block': !isSingle && isLast,
                  })}
                >
                  {crumb.label}
                </span>
              </div>
            )}
            {!isLast && (
              <span className="mx-2">
                <TriangleRightMini />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
};

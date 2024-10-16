import { FC, HTMLAttributes } from 'react';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import InformationCircleIcon from '@heroicons/react/24/solid/InformationCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';

import clsx from 'clsx';

export type AlertAction = FC<HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>>;

const alertClassNameMap = {
  default: {
    wrapper: 'bg-gray-100',
    icon: 'text-gray-400',
    title: 'text-gray-800',
    content: 'text-gray-700',
    action:
      'focus:ring-offset-2 bg-gray-50 text-gray-500 hover:bg-gray-100 focus:ring-offset-gray-50 focus:ring-gray-600',
  },
  success: {
    wrapper: 'bg-green-50',
    icon: 'text-green-400',
    title: 'text-green-800',
    content: 'text-green-700',
    action:
      'focus:ring-offset-2 bg-green-50 text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600',
  },
  error: {
    wrapper: 'bg-red-50',
    icon: 'text-red-400',
    title: 'text-red-800',
    content: 'text-red-700',
    action: 'focus:ring-offset-2 bg-red-50 text-red-500 hover:bg-red-100 focus:ring-offset-red-50 focus:ring-red-600',
  },
  warning: {
    wrapper: 'bg-amber-50',
    icon: 'text-amber-400',
    title: 'text-amber-800',
    content: 'text-amber-700',
    action:
      'focus:ring-offset-2 bg-amber-50 text-amber-500 hover:bg-amber-100 focus:ring-offset-amber-50 focus:ring-amber-600',
  },
  info: {
    wrapper: 'bg-blue-50',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    content: 'text-blue-700',
    action:
      'focus:ring-offset-2 bg-green-50 text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600',
  },
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  type: keyof typeof alertClassNameMap;
  title?: string;
  action?: AlertAction;
  className?: string;
}

export const Alert: FC<AlertProps> = ({ type, title, action, children, className, ...props }) => {
  const iconMap = {
    default: InformationCircleIcon,
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  };

  const Icon = iconMap[type];
  const Action = action;

  return (
    <div className={clsx('@container rounded-md p-4', className, alertClassNameMap[type].wrapper)} {...props}>
      <div className="@sm:flex-row flex flex-col">
        <div className="flex">
          <div className="flex-shrink-0">
            <Icon className={clsx('h-5 w-5', alertClassNameMap[type].icon)} aria-hidden="true" />
          </div>
          <div className="ml-3">
            {title && <h3 className={clsx('text-sm font-bold', alertClassNameMap[type].title)}>{title}</h3>}
            {children && (
              <div className={clsx('text-sm', alertClassNameMap[type].content, { 'mt-1': !!title })}>{children}</div>
            )}
          </div>
        </div>

        {Action && (
          <div className="ml-auto pl-3">
            <div className="@sm:-mb-1.5 @sm:-mt-1.5 -mx-1.5 -mb-1.5 mt-1.5">
              <Action
                className={clsx(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2',
                  alertClassNameMap[type].action,
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

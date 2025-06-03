import { InformationCircle } from '@medusajs/icons';
import { Label as MedusaLabel, Tooltip } from '@medusajs/ui';
import clsx from 'clsx';

interface Props {
  htmlFor?: string;
  children: React.ReactNode;
  tooltip?: string;
  className?: string;
  onClick?: () => void;
}

export const Label = ({ htmlFor, children, tooltip, className, ...props }: Props) => (
  <div className={clsx('flex items-center mb-2 text-gray-500 w-full', className)}>
    <MedusaLabel htmlFor={htmlFor} size="xsmall" {...props}>
      {children}
    </MedusaLabel>
    {tooltip && (
      <Tooltip content={tooltip}>
        <div className="flex items-center justify-center ml-1">
          <InformationCircle className="-scale-75" />
        </div>
      </Tooltip>
    )}
  </div>
);

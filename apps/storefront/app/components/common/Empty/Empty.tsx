import type { FC, ReactNode, SVGAttributes } from 'react';

export interface EmptyProps {
  icon?: FC<SVGAttributes<SVGSVGElement>>;
  action?: ReactNode;
  title: string;
  description: string;
}

export const Empty: FC<EmptyProps> = ({ icon: Icon, title, description, action }) => (
  <div className="py-16 text-center">
    {Icon && (
      <div className="inline-block text-gray-300">
        <Icon className="h-10 w-10" />
      </div>
    )}
    <h2 className="mt-2 text-lg font-bold text-gray-900">{title}</h2>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

import clsx from 'clsx';

export const FieldGroup = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return <div className={clsx('flex flex-col gap-y-small', className)}>{children}</div>;
};

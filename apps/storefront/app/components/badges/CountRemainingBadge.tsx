import clsx from 'clsx';

export const CountRemainingBadge = ({ className, count }: { className?: string; count: number }) => {
  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-md border border-red-200 bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-800',
        className
      )}
    >
      {count} left!
    </div>
  );
};

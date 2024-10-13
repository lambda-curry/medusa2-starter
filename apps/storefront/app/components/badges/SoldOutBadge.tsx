import clsx from 'clsx';

export const SoldOutBadge = ({ className }: { className?: string }) => {
  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-md border border-gray-200 bg-gray-200 px-1.5 py-0.5 text-xs font-bold text-gray-600',
        className,
      )}
    >
      Sold out
    </div>
  );
};

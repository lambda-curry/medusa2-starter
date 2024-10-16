import clsx from 'clsx';

export const HasSaleBadge = ({ className, endingSoon }: { className?: string; endingSoon?: boolean }) => {
  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-md border border-green-200 bg-green-100 px-1.5 py-0.5 text-xs font-bold text-green-800',
        className,
      )}
    >
      {endingSoon ? <>Sale ends soon!</> : <>On sale!</>}
    </div>
  );
};

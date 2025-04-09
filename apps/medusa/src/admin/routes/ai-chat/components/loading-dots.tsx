import { clx } from '@medusajs/ui';

interface LoadingDotsProps {
  className?: string;
}

export const LoadingDots = ({ className }: LoadingDotsProps) => {
  return (
    <span className={clx('inline-flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={clx('block h-2 w-2 rounded-full bg-ui-fg-base opacity-75', 'animate-pulse', {
            'animation-delay-0': i === 0,
            'animation-delay-150': i === 1,
            'animation-delay-300': i === 2,
          })}
          style={{
            animationDuration: '1s',
          }}
        />
      ))}
    </span>
  );
};

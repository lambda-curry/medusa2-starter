import { Container } from '@app/components/common/container';
import clsx from 'clsx';

interface SideBySideSectionProps {
  className?: string;
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const SideBySide = ({
  title,

  className,
  left,
  right,
}: SideBySideSectionProps) => {
  return (
    <Container className={clsx('flex flex-col', className)}>
      {title && <h3 className="text-xl">{title}</h3>}
      {(left || right) && (
        <div className="flex flex-col md:flex-row gap-6 lg:gap-16">
          <div className="flex-1">{left}</div>
          <div className="flex-1">{right}</div>
        </div>
      )}
    </Container>
  );
};

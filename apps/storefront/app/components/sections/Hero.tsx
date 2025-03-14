import clsx from 'clsx';
import type { CustomAction, ImageField } from '@libs/types';
import { ActionList } from '@app/components/common/actions-list/ActionList';
import { Container } from '@app/components/common/container/Container';
import type { FC, ReactNode } from 'react';

export const Hero: FC<{
  title?: string;
  content?: ReactNode;
  actions?: CustomAction[];
  image?: ImageField;
  className?: string;
  backgroundClassName?: string;
  actionsClassName?: string;
  overlayOpacity?: string;
  overlayColor?: string;
}> = ({
  title,
  content,
  actions,
  image,
  className,
  backgroundClassName,
  actionsClassName,
  overlayOpacity = '0.7',
  overlayColor = 'rgba(0, 0, 0, 0.75)',
}) => {
  return (
    <>
      {image?.url && <link rel="preload" href={image?.url} as="image" />}
      <Container className={clsx('flex flex-col justify-center items-center relative w-full', className)}>
        <div
          className={clsx(
            'mkt-section__background-overlay flex-1 z-0 bg-cover bg-no-repeat bg-center',
            backgroundClassName,
          )}
          style={{
            backgroundImage: `url(${image?.url})`,
          }}
        />
        <div
          className={clsx('absolute inset-0 z-[1]', backgroundClassName)}
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, ${overlayColor} 100%)`,
            opacity: overlayOpacity,
          }}
        />
        <div className="overflow-hidden z-10 w-full text-white relative">
          <div className="inline-grid gap-6 w-full">
            {title && <div className="break-words">{title}</div>}
            {typeof content === 'string' ? <div className="text-lg w-full">{content}</div> : content}
          </div>

          {!!actions?.length && (
            <ActionList actions={actions} className={clsx('mt-8 lg:mt-10 flex-col', actionsClassName)} />
          )}
        </div>
      </Container>
    </>
  );
};

export default Hero;

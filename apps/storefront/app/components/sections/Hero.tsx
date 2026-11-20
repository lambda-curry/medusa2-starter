import { ActionList } from '@app/components/common/actions-list/ActionList';
import { Container } from '@app/components/common/container/Container';
import type { CustomAction, ImageField } from '@libs/types';
import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

export const Hero: FC<{
  title?: string;
  content?: ReactNode;
  actions?: CustomAction[];
  image?: ImageField;
  className?: string;
  backgroundClassName?: string;
  actionsClassName?: string;
}> = ({ title, content, actions, image, className, backgroundClassName, actionsClassName }) => {
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
            backgroundImage: image?.url ? `url(${image.url})` : undefined,
          }}
        />
        <div className="overflow-hidden z-10 w-full text-white">
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

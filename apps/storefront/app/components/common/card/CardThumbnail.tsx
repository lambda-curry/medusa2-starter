import { type FC } from 'react';
import clsx from 'clsx';
import { Image } from '../images/Image';

export interface CardThumbnailProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  className?: string;
}

export const CardThumbnail: FC<CardThumbnailProps> = ({ className, ...props }) => {
  if (!props.src) return null;

  return (
    <Image
      className={clsx('not-prose relative flex-grow-0 overflow-hidden rounded-t', className)}
      {...props}
      alt={props.alt || ''}
    />
  );
};

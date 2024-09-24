import { FC, ImgHTMLAttributes } from 'react';
import clsx from 'clsx';
import { ResponsiveImageField } from '@marketplace/util/medusa';
import { Image } from '@components/images/Image';

export interface PostSectionImageProps
  extends ImgHTMLAttributes<HTMLImageElement> {
  image: ResponsiveImageField;
}

export const PostSectionImage: FC<PostSectionImageProps> = ({
  image,
  className,
}) => {
  if (!image?.default?.url) return null;

  return (
    <Image
      className={clsx(`mkt-post-section__image`, className)}
      alt={image?.default?.alt?.value || ''}
      sources={[
        {
          src: image?.mobile?.url || '',
          media: `(max-width: 639px)`,
        },
        {
          src: image?.default?.url,
        },
      ]}
    />
  );
};

import clsx from 'clsx';
import { ImageContentBlock } from '@marketplace/util/medusa/types';
import { ContentBlockComponentProps } from './types';
import { getStyleFromBlockTunes } from '../helpers/get-style-from-block-tunes';
import { Image } from '@components/images/Image';

export const ContentBlockImage: ContentBlockComponentProps<
  ImageContentBlock
> = ({ block }) => {
  const isStretched = block.data.stretched;
  const withBackground = block.data.withBackground;
  const withBorder = block.data.withBorder;
  const alignedCenter = block.tunes?.textAlign.alignment === 'center';
  const alignedRight = block.tunes?.textAlign.alignment === 'right';

  return (
    <figure style={getStyleFromBlockTunes(block.tunes)}>
      <Image
        style={{
          backgroundColor: withBackground ? 'currentcolor' : undefined,
          border: withBorder ? '1px solid currentcolor' : undefined,
          padding: withBorder ? '0.5rem' : undefined,
        }}
        src={block.data.file.url}
        alt={block.data.caption}
        className={clsx('h-auto align-top', isStretched ? 'w-full' : 'w-auto', {
          'mx-auto': !isStretched && alignedCenter,
          'ml-auto': !isStretched && alignedRight,
        })}
      />
      {block.data.caption && (
        <figcaption
          className="mt-2 text-sm text-inherit"
          dangerouslySetInnerHTML={{ __html: block.data.caption }}
        />
      )}
    </figure>
  );
};

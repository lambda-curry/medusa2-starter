import { FC } from 'react';
import clsx from 'clsx';
import { ListContentBlock } from '@marketplace/util/medusa/types';
import { ContentBlockComponentProps } from './types';
import { getStyleFromBlockTunes } from '../helpers/get-style-from-block-tunes';

const RenderListContentBlock: FC<{
  items: ListContentBlock['data']['items'];
  style: ListContentBlock['data']['style'];
}> = ({ items, style }) => {
  const T = style === 'ordered' ? 'ol' : 'ul';

  return (
    <T
      className={clsx('list-inside list-decimal', {
        'list-decimal': style === 'ordered',
        'list-disc': style === 'unordered'
      })}
    >
      {items.map((item, index) => (
        <li key={index} className="text-lg">
          <span dangerouslySetInnerHTML={{ __html: item.content }} />
          {item.items.length > 0 && <RenderListContentBlock style="ordered" items={item.items} />}
        </li>
      ))}
    </T>
  );
};

export const ContentBlockList: ContentBlockComponentProps<ListContentBlock> = ({ block }) => (
  <div style={getStyleFromBlockTunes(block.tunes)}>
    <RenderListContentBlock style={block.data.style} items={block.data.items} />
  </div>
);

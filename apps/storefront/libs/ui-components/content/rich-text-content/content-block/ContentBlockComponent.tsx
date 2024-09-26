import { ContentBlockTypes } from '@libs/util/medusa/types';
import { ContentBlockCode } from './ContentBlockCode';
import { ContentBlockDelimiter } from './ContentBlockDelimiter';
import { ContentBlockHeader } from './ContentBlockHeader';
import { ContentBlockImage } from './ContentBlockImage';
import { ContentBlockList } from './ContentBlockList';
import { ContentBlockParagraph } from './ContentBlockParagraph';
import { ContentBlockQuote } from './ContentBlockQuote';
import { ContentBlockRaw } from './ContentBlockRaw';
import { ContentBlockTable } from './ContentBlockTable';
import { ContentBlockComponentProps } from './types';

export const ContentBlockComponent: ContentBlockComponentProps = ({ block }) => {
  switch (block.type) {
    case ContentBlockTypes.header:
      return <ContentBlockHeader block={block} />;

    case ContentBlockTypes.paragraph:
      return <ContentBlockParagraph block={block} />;

    case ContentBlockTypes.image:
      return <ContentBlockImage block={block} />;

    case ContentBlockTypes.nestedList:
      return <ContentBlockList block={block} />;

    case ContentBlockTypes.delimiter:
      return <ContentBlockDelimiter block={block} />;

    case ContentBlockTypes.quote:
      return <ContentBlockQuote block={block} />;

    case ContentBlockTypes.code:
      return <ContentBlockCode block={block} />;

    case ContentBlockTypes.table:
      return <ContentBlockTable block={block} />;

    case ContentBlockTypes.raw:
      return <ContentBlockRaw block={block} />;
  }

  return null;
};

import { ParagraphContentBlock } from '@marketplace/util/medusa/types';
import { ContentBlockComponentProps } from './types';
import { getStyleFromBlockTunes } from '../helpers/get-style-from-block-tunes';

export const ContentBlockParagraph: ContentBlockComponentProps<ParagraphContentBlock> = ({ block }) => (
  <p dangerouslySetInnerHTML={{ __html: block.data.text }} style={getStyleFromBlockTunes(block.tunes)} />
);

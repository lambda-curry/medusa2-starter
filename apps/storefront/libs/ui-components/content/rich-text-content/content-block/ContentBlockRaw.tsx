import { RawContentBlock } from '@libs/util/medusa/types';
import { ContentBlockComponentProps } from './types';

export const ContentBlockRaw: ContentBlockComponentProps<RawContentBlock> = ({ block }) => (
  <div className="raw" dangerouslySetInnerHTML={{ __html: block.data.html }} />
);

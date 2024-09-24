import { QuoteContentBlock } from '@marketplace/util/medusa/types';
import { ContentBlockComponentProps } from './types';

export const ContentBlockQuote: ContentBlockComponentProps<QuoteContentBlock> = ({ block }) => (
  <blockquote className="border-l-4 border-gray-200 py-1 pl-4 text-2xl italic leading-snug">
    {block.data.text}
    <cite className="mt-2 block text-sm">{block.data.caption}</cite>
  </blockquote>
);

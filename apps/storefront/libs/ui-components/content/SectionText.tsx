import { FC, HTMLAttributes } from 'react';
import { type RichTextContent as MedusaRichTextContent } from '@libs/util/medusa/types';
import { RichTextContent } from './rich-text-content/RichTextContent';

export interface SectionTextProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  content?: MedusaRichTextContent;
}

export const SectionText: FC<SectionTextProps> = ({ className, content, ...props }) => {
  if (!content?.blocks?.length) return null;

  return (
    <div className={className} {...props}>
      <RichTextContent content={content} />
    </div>
  );
};

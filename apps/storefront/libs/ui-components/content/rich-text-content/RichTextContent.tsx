import { RichTextContent as MedusaRichTextContent, type ContentBlock } from '@marketplace/util/medusa/types';
import clsx from 'clsx';
import { FC, HTMLAttributes } from 'react';
import { ContentBlockComponent } from './content-block';

export interface RichTextContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  content?: MedusaRichTextContent;
}

export const RichTextContent: FC<RichTextContentProps> = ({ content, className, ...props }) => {
  if (!content?.blocks?.length) return null;

  return (
    <div className={clsx('rich-text-content prose max-w-none text-lg text-inherit', className)} {...props}>
      {content.blocks.map(block => (
        <ContentBlockComponent key={(block as ContentBlock).id} block={block as ContentBlock} />
      ))}
    </div>
  );
};

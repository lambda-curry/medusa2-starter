import { RenderPostSection } from '@ui-components/content/post-section';
import { RichTextContent } from '@ui-components/content/rich-text-content/RichTextContent';
import { Container } from '@components/container';
import {
  Post,
  PostContentMode,
  PostSection,
  PostTemplate,
} from '@marketplace/util/medusa/types';
import clsx from 'clsx';
import { FC, PropsWithChildren } from 'react';
import { PostData } from '~/routes/api.post-section-data';

export interface PageTemplateProps {
  post: Post | PostTemplate;
  isPreview?: boolean;
  data?: PostData;
}

export const PageTemplate: FC<PropsWithChildren<PageTemplateProps>> = ({
  post,
  isPreview,
  data,
}) => {
  const isAdvancedMode =
    !post.content_mode || post.content_mode === PostContentMode.ADVANCED;

  if (isAdvancedMode && post.sections.length > 0)
    return (
      <>
        {post.sections.map((section, index) => (
          <RenderPostSection
            key={`${section.id}_${index}`}
            section={section as PostSection}
            isPreview={isPreview}
            data={(data || {})[section.id]}
          />
        ))}
      </>
    );

  if (!isAdvancedMode && post.content)
    return (
      <>
        {post.featured_image && (
          <div className="relative h-96 w-full md:h-[500px]">
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-gray-50" />
            <div
              className={clsx(`absolute inset-0 bg-cover bg-center`)}
              style={{
                backgroundImage: post.featured_image
                  ? `url('${post.featured_image.url}')`
                  : '',
              }}
            />
          </div>
        )}

        <section
          className={clsx('relative z-20 pb-20', {
            'mt-32': !post.featured_image,
          })}
        >
          <Container className="prose !max-w-4xl">
            <h1 className="-mt-4 text-4xl md:text-6xl">{post.title}</h1>
            {post.content && <RichTextContent content={post.content} />}
          </Container>
        </section>
      </>
    );

  return null;
};

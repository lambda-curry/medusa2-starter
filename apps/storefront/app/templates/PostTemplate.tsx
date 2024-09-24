import { FC, PropsWithChildren } from 'react';
import clsx from 'clsx';
import truncate from 'lodash/truncate';
import {
  type Post,
  PostContentMode,
  type PostSection,
} from '@marketplace/util/medusa/types';
import { formatDate, formatList } from '@marketplace/util/formatters';
import { RenderPostSection } from '@ui-components/content/post-section';
import { RichTextContent } from '@ui-components/content/rich-text-content';
import { Container } from '@components/container/Container';
import { Share } from '~/components/share';
import { PostData } from '~/routes/api.post-section-data';
import { imageProxyURL } from '../../../markethaus/utils/img-proxy';

export interface PostTemplateProps {
  post: Post;
  isPreview?: boolean;
  data?: PostData;
}

export const PostTemplate: FC<PropsWithChildren<PostTemplateProps>> = ({
  post,
  isPreview,
  data,
}) => {
  const isBasic = post.content_mode === PostContentMode.BASIC;
  const isAdvanced = post.content_mode === PostContentMode.ADVANCED;

  const authorsList = formatList(
    (post.authors || [])
      .filter(author => !!author.first_name)
      .map(author =>
        author.last_name
          ? `${author.first_name} ${author.last_name}`
          : author.first_name
      )
  );

  const publishedDate = formatDate(
    new Date(post.published_at || post.created_at)
  );

  return (
    <>
      {isBasic && (
        <>
          {post.featured_image && (
            <div
              className="relative h-96 w-full md:h-[500px]"
              style={{
                viewTransitionName: 'post-thumbnail',
              }}
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-gray-50" />
              <div
                className={clsx(`absolute inset-0 bg-cover bg-center`)}
                style={{
                  backgroundImage: post.featured_image
                    ? `url('${imageProxyURL(post.featured_image.url, {
                        context: 'post_header',
                      })}')`
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
              <header className="flex gap-4">
                <h1 className="-mt-4 text-4xl md:text-6xl">{post.title}</h1>
                <div className="flex-1" />
                <Share
                  itemType="post"
                  shareData={{
                    title: post.title,
                    text: truncate(post.seo?.description || post.excerpt, {
                      length: 200,
                      separator: ' ',
                    }),
                  }}
                />
              </header>

              {post.content && <RichTextContent content={post.content} />}

              {authorsList.length > 0 && (
                <span className="text-xs">Written by {authorsList}.</span>
              )}

              <span className="text-xs">Published on {publishedDate}.</span>
            </Container>
          </section>
        </>
      )}

      {isAdvanced && !!post.sections.length && (
        <>
          {post.sections.map(section => (
            <RenderPostSection
              key={section.id}
              section={section as PostSection}
              isPreview={isPreview}
              data={data?.[section.id]}
            />
          ))}
        </>
      )}
    </>
  );
};

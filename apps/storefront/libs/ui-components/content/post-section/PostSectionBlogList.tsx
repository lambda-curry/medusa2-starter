import clsx from 'clsx';
import { useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { type BlogListPostSection } from '@marketplace/util/medusa/types';
import { PostSectionBase } from './shared/PostSectionBase';
import { type PostSectionComponent } from './types';
import { PageHeading } from '../PageHeading';
import { SectionText } from '../SectionText';
import { Container } from '@components/container/Container';
import { CardGrid } from '@components/card/CardGrid';
import { PostCard } from '../../../../app/components/cards/PostCard';
import { Suspense } from 'react';
import { Await } from '@remix-run/react';
import type { Post } from '@marketplace/util/medusa';
import { buildSearchParamsFromObject } from '../../../util';
import { LoaderFunctionArgs } from '@remix-run/node';

export const PostSectionBlogList: PostSectionComponent<
  BlogListPostSection,
  Promise<{
    posts: Post[];
    paginationConfig: {
      limit: number;
      offset: number;
      count: number;
      prefix: string;
    };
  }>
> = ({ section, data }) => {
  const { heading, text } = section.content;
  const fetcher = useFetcher<(args: LoaderFunctionArgs) => { posts: Post[] }>();

  const queryString = buildSearchParamsFromObject({
    subloader: 'blogPostList',
    data: JSON.stringify({
      id: section.id,
    }),
  });

  useEffect(() => {
    if (fetcher.data === undefined) {
      fetcher.load(`/api/post-section-data?${queryString}`);
    }
  }, [fetcher.data]);

  const isPreview =
    typeof window !== 'undefined' &&
    window.location.pathname.includes('/preview');

  return (
    <PostSectionBase
      section={section}
      className={clsx(
        `[--default-background-color:white] [--default-text-align:center]`,
        `border-b-gray-200 first:border-b group-first:border-b`
      )}
    >
      <Container>
        <div className="inline-grid max-w-prose gap-6">
          {heading && <PageHeading>{heading.value}</PageHeading>}
          <SectionText content={text?.value} />
        </div>

        {isPreview ? (
          <>
            {fetcher.state === 'loading' && <div>Loading posts...</div>}
            {fetcher.data && (
              <CardGrid>
                {fetcher.data.posts.map(post => (
                  <PostCard key={post.id} post={post as unknown as Post} />
                ))}
              </CardGrid>
            )}
            {fetcher.data && fetcher.data.posts.length === 0 && (
              <div className="my-8 font-bold">No posts found</div>
            )}
          </>
        ) : (
          <Suspense fallback={<div>Loading posts...</div>}>
            <Await resolve={data}>
              {resolvedData => {
                if (!resolvedData) return null;

                const { posts } = resolvedData;
                return posts.length > 0 ? (
                  <CardGrid>
                    {posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </CardGrid>
                ) : (
                  <div className="my-8 font-bold">No posts found</div>
                );
              }}
            </Await>
          </Suspense>
        )}
      </Container>
    </PostSectionBase>
  );
};

export default PostSectionBlogList;

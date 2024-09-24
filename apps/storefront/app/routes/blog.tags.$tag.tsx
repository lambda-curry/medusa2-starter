import { CardGrid } from '@components/card/CardGrid';
import { Container } from '@components/container/Container';
import { PaginationWithContext } from '@components/Pagination/pagination-with-context';
import { PageHeading } from '@ui-components/content/PageHeading';
import {
  PostType,
  type Post,
  type PostsListQueryOptions,
} from '@marketplace/util/medusa';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { withPaginationParams } from '@marketplace/util/remix';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';
import { PostCard } from '~/components/cards/PostCard';

export interface BlogFiltersValues {
  tags?: string;
}

export const blogFiltersFormValidator = withYup(
  Yup.object().shape({
    tags: Yup.string().optional(),
  })
);

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });

  const { limit, offset } = withPaginationParams({ request });

  const tag = params.tag;

  const tagListQueryOptions: PostsListQueryOptions = {
    type: PostType.POST,
    limit,
    offset,
    // tags: [tag] TODO: Add this back in when we have a way to filter by tags
  };

  const { posts, count } = await client.posts.list(tagListQueryOptions);

  if (posts.length === 0) throw redirect('/');

  return { tag, posts, paginationConfig: { limit, offset, count } };
};

export default function BlogRoute() {
  const { posts, tag, paginationConfig } = useLoaderData<typeof loader>();

  return (
    <Container className="py-12">
      <PageHeading>
        <div className="flex flex-wrap items-center gap-2">
          Posts tagged with
          <span className="bg-primary-100 text-primary-700 ring-primary-500/20 py-0.25 inline-flex items-center rounded-lg px-2 font-medium ring-[0.5px] ring-inset">
            {tag}
          </span>
        </div>
      </PageHeading>

      {posts.length > 0 && (
        <CardGrid>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </CardGrid>
      )}

      <PaginationWithContext
        context={'blog'}
        paginationConfig={paginationConfig}
      />
    </Container>
  );
}

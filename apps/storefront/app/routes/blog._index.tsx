import { CardGrid } from '@components/card/CardGrid';
import { Container } from '@components/container/Container';
import { PaginationWithContext } from '@components/Pagination/pagination-with-context';
import { PageHeading } from '@ui-components/content/PageHeading';
import { PostType, type PostsListQueryOptions } from '@marketplace/util/medusa';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { withPaginationParams } from '@marketplace/util/remix';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useLocation } from '@remix-run/react';
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });

  const prefix = 'blog';

  const { limit, offset } = withPaginationParams({ request, prefix });

  const tagListQueryOptions: PostsListQueryOptions = {
    type: PostType.POST,
    limit,
    offset,
  };

  const { posts, count } = await client.posts.list(tagListQueryOptions);

  if (posts.length === 0) throw redirect('/');

  return { posts, paginationConfig: { limit, offset, count, prefix } };
};

export default function BlogRoute() {
  const location = useLocation();
  const { posts, paginationConfig } = useLoaderData<typeof loader>();

  return (
    <Container className="py-12">
      <PageHeading className="text-center">Blog</PageHeading>

      {posts.length > 0 && (
        <CardGrid>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </CardGrid>
      )}

      <PaginationWithContext
        context={location.pathname}
        paginationConfig={paginationConfig}
      />
    </Container>
  );
}

import { Container } from '@components/container';
import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { PageTemplate } from '~/templates/PageTemplate';
import { getMergedPostMeta } from '@libs/util/posts';
import {
  fetchPostData,
  getHomePage,
} from '@libs/util/server/posts.server';

export const loader = async (args: LoaderFunctionArgs) => {
  const post = await getHomePage(args);

  const data = fetchPostData({ post: post!, ...args });

  return { post, ...data };
};

export const meta: MetaFunction<typeof loader> = getMergedPostMeta;

export default function IndexRoute() {
  const { post, ...data } = useLoaderData<typeof loader>();

  if (!post)
    return (
      <Container className="my-8">
        <h2>This page doesn't exist.</h2>
      </Container>
    );

  return <PageTemplate post={post} data={data} />;
}

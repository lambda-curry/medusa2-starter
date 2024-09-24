import { LoaderFunctionArgs, redirect, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { PageTemplate } from '~/templates/PageTemplate';
import { getMergedPostMeta } from '@marketplace/util/posts';
import { fetchPostData, getPost } from '@marketplace/util/server/posts.server';

export const loader = async (LoaderFunctionArgs: LoaderFunctionArgs) => {
  const post = await getPost(LoaderFunctionArgs);

  if (!post) throw redirect('/');

  const data = fetchPostData({ post: post!, ...LoaderFunctionArgs });

  return { post, ...data };
};

export const meta: MetaFunction<typeof loader> = getMergedPostMeta;

export default function PageRoute() {
  const { post, ...data } = useLoaderData<typeof loader>();

  return <PageTemplate post={post} data={data} />;
}

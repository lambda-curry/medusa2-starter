import { getMergedPostMeta } from '@marketplace/util/posts';
import { fetchPostData, getPost } from '@marketplace/util/server/posts.server';
import { redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { PostTemplate } from '~/templates/PostTemplate';

export const loader = async (LoaderFunctionArgs: LoaderFunctionArgs) => {
  const post = await getPost(LoaderFunctionArgs);

  const data = fetchPostData({ post: post!, ...LoaderFunctionArgs });

  if (!post || !data) throw redirect('/');

  return { post, ...data };
};

export const meta: MetaFunction<typeof loader> = getMergedPostMeta;

export default function BlogDetailRoute() {
  const { post, ...data } = useLoaderData<typeof loader>();

  return <PostTemplate post={post} data={data} />;
}
